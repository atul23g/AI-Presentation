"use server";
import lemonSqueezyClient from "@/lib/axios";

// Test function to validate Lemon Squeezy configuration and get test data




export const buySubscription = async (buyUserId: string) => {
  try {
    // Validate required environment variables
    const requiredEnvVars = {
      LEMON_SQUEEZY_API_KEY: process.env.LEMON_SQUEEZY_API_KEY,
      LEMON_SQUEEZY_STORE_ID: process.env.LEMON_SQUEEZY_STORE_ID,
      LEMON_SQUEEZY_VARIANT_ID: process.env.LEMON_SQUEEZY_VARIANT_ID,
      NEXT_PUBLIC_HOST_URL: process.env.NEXT_PUBLIC_HOST_URL,
    };

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      console.error("❌ Missing environment variables:", missingVars);
      return { 
        message: "Payment system not configured. Please contact support.", 
        status: 500 
      };
    }

    try {
    console.log("🟢 Creating checkout session for user:", buyUserId);
    
    const requestBody = {
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            custom: {
              buyerUserId: buyUserId,
            },
          },
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: "181053",
            },
          },
          variant: {
            data: {
              type: "variants",
              id: "938319",
            },
          },
        },
      },
    };



    
    const res = await lemonSqueezyClient().post("/checkouts", requestBody);

    const checkoutUrl = res.data.data.attributes.url;
    
    return { url: checkoutUrl, status: 200 };
  } catch (error: any) {
    console.error("❌ Lemon Squeezy API Error:", error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      return { 
        message: "Invalid JWT token. Please check your Lemon Squeezy test mode configuration.", 
        status: 401 
      };
    }
    
    if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.errors?.[0]?.detail || 
                          error.response?.data?.message || 
                          "Invalid request data";
      return { 
        message: `Bad Request: ${errorMessage}`, 
        status: 400 
      };
    }
    
    if (error.response?.status === 422) {
      return { 
        message: "Invalid checkout data. Please check your store and variant IDs.", 
        status: 422 
      };
    }
    
    if (error.response?.status === 404) {
      return { 
        message: "Store or variant not found in test mode. Please check your Lemon Squeezy test store and variant IDs.", 
        status: 404 
      };
    }
    
    return { 
      message: error.response?.data?.message || "Failed to create checkout session", 
      status: error.response?.status || 500 
    };
    }
  } catch (outerError: any) {
    console.error("❌ Unexpected error in buySubscription:", outerError);
    return { 
      message: "An unexpected error occurred while creating checkout session", 
      status: 500 
    };
  }
};
