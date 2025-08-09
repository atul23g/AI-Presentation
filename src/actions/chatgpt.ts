"use server";

import { client } from "@/lib/prisma";
import { ContentItem, ContentType, Slide } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || "";

/**
 * Gemini text completion call
 */
const geminiComplete = async (prompt: string): Promise<string> => {
  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const body = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  };
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", errorData);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Extract the text content from Gemini response
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.error("No text in Gemini response:", data);
      throw new Error("No text content received from Gemini");
    }
    
    return text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw error;
  }
};

export const generateCreativePrompt = async (userPrompt: string) => {
  const finalPrompt = `
    Create a coherent and relevant outline for the following prompt: ${userPrompt}.
    The outline should consist of at least 6 points, with each point written as a single sentence.
    Ensure the outline is well-structured and directly related to the topic. 
    Return the output in the following JSON format:

    {
      "outlines": [
        "Point 1",
        "Point 2",
        "Point 3",
        "Point 4",
        "Point 5",
        "Point 6"
      ]
    }

    Ensure that the JSON is valid and properly formatted. Do not include any other text or explanations outside the JSON.
    `;

  try {
    console.log("🟢 Calling Gemini API with prompt:", finalPrompt.substring(0, 100) + "...");
    const responseContent = await geminiComplete(finalPrompt);
    console.log("🟢 Gemini response received:", responseContent?.substring(0, 200) + "...");

    if (responseContent) {
      try {
        // Clean up the response by removing markdown code blocks if present
        let cleanedResponse = responseContent.trim();
        if (cleanedResponse.startsWith('```json')) {
          cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedResponse.startsWith('```')) {
          cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        const jsonResponse = JSON.parse(cleanedResponse);
        console.log("🟢 JSON parsed successfully:", jsonResponse);
        return { status: 200, data: jsonResponse };
      } catch (error) {
        console.error("Invalid JSON received:", responseContent, error);
        return { status: 500, error: "Invalid JSON format received from AI" };
      }
    }

    return { status: 400, error: "No content generated" };
  } catch (error) {
    console.error("🔴 ERROR in generateCreativePrompt:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Handle specific Gemini quota error
    if (errorMessage.includes('429') || errorMessage.includes('quota')) {
      console.log("🔴 Gemini quota exceeded, generating fallback outline...");
      // Generate a fallback outline based on the user prompt
      const fallbackOutline = generateFallbackOutline(userPrompt);
      return { status: 200, data: { outlines: fallbackOutline } };
    }
    
    return { status: 500, error: `Internal server error: ${errorMessage}` };
  }
};

// Helper function to generate fallback outlines when API quota is exceeded
const generateFallbackOutline = (userPrompt: string): string[] => {
  const topic = userPrompt.toLowerCase();
  
  // Create generic but relevant outline points based on the topic
  const fallbackOutlines = [
    `Introduction to ${userPrompt} and its significance`,
    `Key concepts and principles of ${userPrompt}`,
    `Historical background and development of ${userPrompt}`,
    `Current applications and real-world examples of ${userPrompt}`,
    `Benefits and advantages of ${userPrompt}`,
    `Future trends and developments in ${userPrompt}`,
    `Conclusion and key takeaways about ${userPrompt}`
  ];
  
  console.log("🟢 Generated fallback outline for:", userPrompt);
  return fallbackOutlines;
};

// Generate Images (Replicate SDXL) - Enhanced with better error handling
// Professional fallback images for when Replicate fails
const PROFESSIONAL_IMAGES = [
  "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?q=80&w=2126&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
];

// Helper function for Replicate image generation
const generateImageWithReplicate = async (prompt: string, apiToken: string): Promise<string> => {
  const improvedPrompt = `
    Create a highly realistic, professional image based on the following description. The image should look as if captured in real life, with attention to detail, lighting, and texture. 

    Description: ${prompt}

    Important Notes:
    - The image must be in a photorealistic style and visually compelling.
    - Ensure all text, signs, or visible writing in the image are in English.
    - Pay special attention to lighting, shadows, and textures to make the image as lifelike as possible.
    - Avoid elements that appear abstract, cartoonish, or overly artistic. The image should be suitable for professional presentations.
    - Focus on accurately depicting the concept described, including specific objects, environment, mood, and context. Maintain relevance to the description provided.

    Example Use Cases: Business presentations, educational slides, professional designs.
    `;

    const replicateResponse = await fetch(
      "https://api.replicate.com/v1/predictions",
      {
        method: "POST",
        headers: {
          "Authorization": `Token ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: "7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc", // Stability AI SDXL version
          input: {
            prompt: improvedPrompt,
            width: 1024,
            height: 768,
            num_outputs: 1,
            scheduler: "K_EULER",
            num_inference_steps: 30,
            guidance_scale: 7.5,
            refine: "expert_ensemble_refiner",
            refine_steps: 5,
          },
        }),
      }
    );

    if (!replicateResponse.ok) {
      if (replicateResponse.status === 402) {
        console.log("🔴 Replicate API: Payment required. Using professional fallback image.");
        return PROFESSIONAL_IMAGES[Math.floor(Math.random() * PROFESSIONAL_IMAGES.length)];
      }
      throw new Error(`Replicate API error: ${replicateResponse.status} ${replicateResponse.statusText}`);
    }

    const data = await replicateResponse.json();
    console.log(`🟢 Replicate prediction started: ${data.id}`);

    if (!data.id) {
      throw new Error("No prediction ID received from Replicate");
    }

    // Poll for completion with timeout
    let outputUrl = null;
    let getResult = data;
    const predictionId = data.id;
    const maxAttempts = 30; // 60 seconds max
    let attempts = 0;

    while (
      (getResult.status === "starting" || getResult.status === "processing") &&
      attempts < maxAttempts
    ) {
      attempts++;
      console.log(`🟢 Polling attempt ${attempts}/${maxAttempts}, status: ${getResult.status}`);
      
      await new Promise((r) => setTimeout(r, 2000));
      
      const pollRes = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            Authorization: `Token ${REPLICATE_API_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (!pollRes.ok) {
        throw new Error(`Polling error: ${pollRes.status} ${pollRes.statusText}`);
      }
      
      getResult = await pollRes.json();
    }

    if (getResult.status === "succeeded" && getResult.output && getResult.output.length > 0) {
      outputUrl = getResult.output[0];
      console.log(`✅ Image generated successfully: ${outputUrl}`);
      return outputUrl;
    } else if (getResult.status === "failed") {
      console.log(`🔴 Image generation failed: ${getResult.error}`);
      throw new Error(`Image generation failed: ${getResult.error}`);
    } else if (attempts >= maxAttempts) {
      console.log("🔴 Image generation timed out");
      throw new Error("Image generation timed out");
    } else {
      console.log("🔴 Unknown status:", getResult.status);
      throw new Error(`Unknown status: ${getResult.status}`);
    }
  };

// Alternative image generation using Unsplash API
const generateImageWithAlternative = async (prompt: string): Promise<string> => {
  try {
    console.log("🟢 Using Unsplash API for:", prompt.substring(0, 30));
    
    // Extract relevant keywords from the prompt
    const searchTerms = prompt.toLowerCase()
      .split(' ')
      .filter(word => word.length > 3) // Filter out short words
      .slice(0, 3) // Take first 3 meaningful words
      .join(' ');
    
    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || "";
    
    if (!UNSPLASH_ACCESS_KEY) {
      console.log("🔴 No Unsplash API key found, using fallback");
      return PROFESSIONAL_IMAGES[Math.floor(Math.random() * PROFESSIONAL_IMAGES.length)];
    }
    
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerms)}&per_page=1&orientation=landscape&content_filter=high`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const imageUrl = data.results[0].urls.regular;
        console.log("✅ Unsplash image found:", imageUrl.substring(0, 50) + "...");
        return imageUrl;
      }
    }
    
    console.log("🔴 No Unsplash results found, using fallback");
  } catch (error) {
    console.log("🔴 Unsplash API failed:", error);
  }
  
  // Fallback to professional images if Unsplash fails
  return PROFESSIONAL_IMAGES[Math.floor(Math.random() * PROFESSIONAL_IMAGES.length)];
};

// Main image generation function
const generateImageUrl = async (prompt: string): Promise<string> => {
  try {
    console.log(`🟢 Starting image generation for: ${prompt.substring(0, 50)}...`);
    
    const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || "";
    
    // Try Replicate first if token is available and billing is set up
    if (REPLICATE_API_TOKEN) {
      try {
        return await generateImageWithReplicate(prompt, REPLICATE_API_TOKEN);
      } catch (error) {
        console.log("🔴 Replicate failed, trying Unsplash...");
      }
    }
    
    // Use zi as primary image source
    console.log("🟢 Using Unsplash API for image generation");
    return await generateImageWithAlternative(prompt);
  } catch (error) {
    console.log("🔴 All image generation failed, using professional fallback image");
    return PROFESSIONAL_IMAGES[Math.floor(Math.random() * PROFESSIONAL_IMAGES.length)];
  }
};

const findImageComponents = (layout: ContentItem): ContentItem[] => {
  const images = [];
  if (layout.type === "image") {
    images.push(layout);
  }
  if (Array.isArray(layout.content)) {
    layout.content.forEach((child) => {
      images.push(...findImageComponents(child as ContentItem));
    });
  } else if (layout.content && typeof layout.content === "object") {
    images.push(...findImageComponents(layout.content));
  }
  return images;
};

const replaceImagePlaceholders = async (layout: Slide) => {
  const imageComponents = findImageComponents(layout.content);
  console.log(`🟢 Found ${imageComponents.length} image components in layout: ${layout.slideName || 'Untitled'}`);
  
  for (const component of imageComponents) {
    const altText = component.alt || "Professional presentation image";
    console.log(`🟢 Generating image for: ${altText.substring(0, 50)}...`);
    
              try {
                const imageUrl = await generateImageUrl(altText);
                component.content = imageUrl;
                console.log(`✅ Image generated successfully: ${imageUrl.substring(0, 50)}...`);
              } catch (error) {
                console.log(`🔴 Failed to generate image for component:`, error);
                if (error instanceof Error && error.message.includes('402')) {
                  console.log("🔴 Payment required for Replicate API. Please add billing to your account.");
                }
                component.content = PROFESSIONAL_IMAGES[Math.floor(Math.random() * PROFESSIONAL_IMAGES.length)];
              }
  }
  
  console.log(`🟢 Completed image processing for layout: ${layout.slideName || 'Untitled'}`);
};

/**
 * Advanced JSON cleaning and repair function
 */
const cleanAndRepairJSON = (responseContent: string): string => {
  let cleanedResponse = responseContent.trim();
  
  // Remove markdown code blocks if present
  if (cleanedResponse.startsWith('```json')) {
    cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanedResponse.startsWith('```')) {
    cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  
  // Find the last complete JSON object by looking for the last closing brace
  const lastBraceIndex = cleanedResponse.lastIndexOf('}');
  if (lastBraceIndex !== -1) {
    cleanedResponse = cleanedResponse.substring(0, lastBraceIndex + 1);
  }
  
  // Clean up common JSON issues
  cleanedResponse = cleanedResponse
    .replace(/,\s*}/g, '}') // Remove trailing commas in objects
    .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
    .replace(/\n/g, ' ') // Remove newlines
    .replace(/\r/g, '') // Remove carriage returns
    .replace(/\t/g, ' ') // Replace tabs with spaces
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  return cleanedResponse;
};

/**
 * Validate JSON structure and content
 */
const validateLayoutJSON = (jsonString: string): boolean => {
  try {
    const parsed = JSON.parse(jsonString);
    
    // Check if it's a valid layout object
    return (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.slideName === 'string' &&
      typeof parsed.type === 'string' &&
      parsed.content &&
      typeof parsed.content === 'object'
    );
  } catch {
    return false;
  }
};

/**
 * Generate a single layout for one outline (improved version)
 */
const generateSingleLayout = async (outline: string, index: number): Promise<any | null> => {
  const prompt = `### IMPORTANT: Generate ONE complete JSON layout object for a presentation slide.

OUTLINE: "${outline}"

REQUIREMENTS:
1. Generate exactly ONE layout based ONLY on the provided outline
2. Use layout types: "accentLeft", "accentRight", "imageAndText", "textAndImage", "twoColumns", "twoColumnsWithHeadings", "threeColumns", "threeColumnsWithHeadings", "fourColumns", "twoImageColumns", "threeImageColumns", "fourImageColumns", "tableLayout"
3. Content types: "heading1", "heading2", "heading3", "heading4", "title", "paragraph", "table", "resizable-column", "image", "blockquote", "numberedList", "bulletList", "todoList", "calloutBox", "codeBlock", "tableOfContents", "divider", "column"
4. Include relevant images with descriptive alt text
5. Fill all content fields with meaningful data related to the outline

STRICT FORMAT - Return ONLY this JSON structure:
\`\`\`json
{
  "id": "unique-id-here",
  "slideName": "Descriptive slide title",
  "type": "imageAndText",
  "slideOrder": ${index + 1},
  "className": "min-h-[300px]",
  "content": {
    "id": "unique-content-id",
    "type": "column",
    "name": "Column",
    "content": [
      {
        "id": "unique-heading-id",
        "type": "heading1",
        "name": "Heading1",
        "content": "Your main heading here",
        "placeholder": "Heading1"
      },
      {
        "id": "unique-paragraph-id",
        "type": "paragraph",
        "name": "Paragraph",
        "content": "Detailed content based on the outline",
        "placeholder": "Content"
      },
      {
        "id": "unique-image-id",
        "type": "image",
        "name": "Image",
        "content": "placeholder-image.jpg",
        "alt": "Descriptive alt text related to the outline topic",
        "placeholder": "Image"
      }
    ]
  }
}
\`\`\`

Generate the complete JSON now:`;

  try {
    console.log(`🟢 Generating layout ${index + 1} for: ${outline.substring(0, 50)}...`);
    
    const responseContent = await geminiComplete(prompt);
    if (!responseContent) {
      console.log(`🔴 No response for outline ${index + 1}`);
      return null;
    }

    // Clean and repair the JSON response
    const cleanedResponse = cleanAndRepairJSON(responseContent);
    console.log(`🟢 Cleaned JSON (${cleanedResponse.length} chars): ${cleanedResponse.substring(0, 150)}...`);

    // Validate before parsing
    if (!validateLayoutJSON(cleanedResponse)) {
      console.log(`🔴 Invalid JSON structure for layout ${index + 1}`);
      return null;
    }

    const layout = JSON.parse(cleanedResponse);
    
    // Ensure the layout has all required fields and globally unique IDs
    // Always override incoming IDs to prevent duplicate keys across slides
    const slideId = uuidv4();
    layout.id = slideId;
    layout.slideOrder = index + 1;
    
    // Ensure all content has unique IDs that include slide ID
    if (layout.content) {
      layout.content.id = layout.content.id || `${slideId}-content-${uuidv4()}`;
      if (layout.content.content && Array.isArray(layout.content.content)) {
        layout.content.content.forEach((item: any, itemIndex: number) => {
          item.id = `${slideId}-item-${itemIndex}-${uuidv4()}`;
        });
      }
    }
    
    console.log(`✅ Successfully generated layout ${index + 1}: ${layout.slideName}`);
    return layout;
    
  } catch (error) {
    // Re-throw quota errors to be caught by the parent function
    if (error instanceof Error && error.message.includes('429')) {
      throw error;
    }
    console.log(`🔴 Error generating layout ${index + 1}:`, error);
    return null;
  }
};

/**
 * Create enhanced fallback layout with images and varied content
 */
const createEnhancedFallbackLayout = (outline: string, index: number) => {
  // Create different layout types for variety
  const layoutTypes = ["imageAndText", "textAndImage", "twoColumns", "accentLeft", "accentRight"];
  const selectedType = layoutTypes[index % layoutTypes.length];
  
  // Extract meaningful title from outline
  const title = outline.split('.')[0].split(',')[0].substring(0, 80).trim();
  const description = outline.length > title.length ? outline.substring(title.length).trim() : "Explore the key concepts and insights related to this topic.";
  
  const slideId = uuidv4();
  return {
    id: slideId,
    slideName: title || `Slide ${index + 1}`,
    type: selectedType,
    slideOrder: index + 1,
    className: "min-h-[300px]",
    content: {
      id: `${slideId}-content-${uuidv4()}`,
      type: "column" as ContentType,
      name: "Column",
      content: [
        {
          id: `${slideId}-item-0-${uuidv4()}`,
          type: "heading1" as ContentType,
          name: "Heading1",
          content: title,
          placeholder: "Heading1",
        },
        {
          id: `${slideId}-item-1-${uuidv4()}`,
          type: "paragraph" as ContentType,
          name: "Paragraph",
          content: description || outline,
          placeholder: "Content",
        },
        {
          id: `${slideId}-item-2-${uuidv4()}`,
          type: "image" as ContentType,
          name: "Image",
          content: PROFESSIONAL_IMAGES[Math.floor(Math.random() * PROFESSIONAL_IMAGES.length)],
          alt: `Professional illustration representing ${title.substring(0, 80)}`,
          placeholder: "Image",
        },
        // Add bullet points for better content structure
        {
          id: `${slideId}-item-3-${uuidv4()}`,
          type: "bulletList" as ContentType,
          name: "BulletList",
          content: [
            "Key concepts and definitions",
            "Practical applications and examples", 
            "Benefits and considerations",
            "Future trends and developments"
          ],
          placeholder: "Bullet List",
        },
      ],
    },
  };
};

// Layout Generation - ONE AT A TIME APPROACH
export const generateLayoutsJson = async (outlineArray: string[]) => {
  const layouts: any[] = [];
  const maxRetries = 2;
  let quotaExhausted = false;
  
  console.log(`🟢 Starting layout generation for ${outlineArray.length} outlines (one at a time)...`);
  
  for (let i = 0; i < outlineArray.length; i++) {
    const outline = outlineArray[i];
    let layout = null;
    let retryCount = 0;
    
    // Skip API calls if quota is exhausted
    if (quotaExhausted) {
      console.log(`⚠️ Skipping API call for layout ${i + 1} due to quota exhaustion, using fallback`);
      layout = createEnhancedFallbackLayout(outline, i);
    } else {
      // Retry logic for each individual layout
      while (retryCount < maxRetries && !layout && !quotaExhausted) {
        if (retryCount > 0) {
          console.log(`🔄 Retry ${retryCount} for layout ${i + 1}...`);
          // Add delay between retries to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        try {
          layout = await generateSingleLayout(outline, i);
          if (layout) {
            console.log(`✅ Successfully generated layout ${i + 1} from API`);
          }
        } catch (error) {
          if (error instanceof Error && error.message.includes('429')) {
            console.log(`🔴 Quota exhausted detected at layout ${i + 1}, switching to fallback mode for remaining layouts`);
            quotaExhausted = true;
            break;
          }
        }
        retryCount++;
      }
      
      // Use fallback if all retries failed
      if (!layout) {
        console.log(`🟡 Using fallback layout for outline ${i + 1}`);
        layout = createEnhancedFallbackLayout(outline, i);
      }
    }
    
    layouts.push(layout);
    
    // Add small delay between requests only if not using fallbacks
    if (i < outlineArray.length - 1 && !quotaExhausted) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Process images for all layouts (in parallel for efficiency)
  console.log(`🟢 Processing images for ${layouts.length} layouts...`);
  try {
    await Promise.all(layouts.map(async (layout, index) => {
      try {
        await replaceImagePlaceholders(layout);
        console.log(`🟢 Images processed for layout ${index + 1}`);
      } catch (error) {
        console.log(`🔴 Failed to process images for layout ${index + 1}:`, error);
      }
    }));
  } catch (error) {
    console.log("🔴 Error processing images:", error);
  }

  console.log(`🟢 All ${layouts.length} layouts generated successfully`);
  return { status: 200, data: layouts };
};

export const generateLayouts = async (projectId: string, theme: string) => {
  try {
    if (!projectId) {
      return { status: 400, error: "Project ID is required" };
    }
    const user = await currentUser();
    if (!user) {
      return { status: 403, error: "User not authenticated" };
    }

    const userExist = await client.user.findUnique({
      where: { clerkId: user.id },
    });

    // Allow slide generation for any authenticated user. We no longer gate on subscription here
    if (!userExist) {
      return { status: 403, error: "User not found in the database" };
    }

    const project = await client.project.findUnique({
      where: { id: projectId, isDeleted: false },
    });

    if (!project) {
      return { status: 404, error: "Project not found" };
    }

    if (!project.outlines || project.outlines.length === 0) {
      return { status: 400, error: "Project does not have any outlines" };
    }

    const layouts = await generateLayoutsJson(project.outlines);

    if (layouts.status !== 200) {
      return layouts;
    }

    // Ensure layouts.data is an array before saving
    const slidesData = Array.isArray(layouts.data) ? layouts.data : [layouts.data];
    console.log(`🟢 Saving ${slidesData.length} slides to database...`);
    console.log(`🟢 Slides data type:`, typeof slidesData);
    console.log(`🟢 Slides is array:`, Array.isArray(slidesData));

    await client.project.update({
      where: { id: projectId },
      data: { slides: slidesData, themeName: theme },
    });

    console.log(`✅ Successfully saved slides to database`);
    return { status: 200, data: slidesData };
  } catch (error) {
    console.error("🔴 ERROR:", error);
    
    // Handle specific Gemini quota error
    if (error instanceof Error && error.message.includes('429')) {
      return { 
        status: 429, 
        error: "API quota exceeded. Please wait a moment and try again.", 
        data: [] 
      };
    }
    
    return { status: 500, error: "Internal server error", data: [] };
  }
};
