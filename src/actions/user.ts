"use server"
import { currentUser } from "@clerk/nextjs/server";
import { client } from "@/lib/prisma"; // Ensure correct import path

export const onAuthenticateUser = async () => {
    try {
        //console.log("🟢 Attempting to get current user from Clerk...");
        const user = await currentUser();

        if (!user) {
            //console.log("🔴 No user found from Clerk");
            return { status: 403, error: "No authenticated user found" };
        }

        //console.log("🟢 User found from Clerk:", user.id);

        const userExist = await client.user.findUnique({
            where: {
                clerkId: user.id,
            },
            include: {
                PurchasedProjects: {
                    select: {
                        id: true,
                    },
                },
            },
        });

        if (userExist) {
            //console.log("🟢 Existing user found in database");
            return {
                status: 200,
                user: userExist,
            };
        }

        //console.log("🟢 Creating new user in database...");
        const newUser = await client.user.create({
            data: {
                clerkId: user.id,
                email: user.emailAddresses[0]?.emailAddress || "",
                name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
                profileImage: user.imageUrl,
            },
        });

        if (newUser) {
            console.log("🟢 New user created successfully");
            return { status: 201, user: newUser };
        }

        //console.log("🔴 Failed to create new user");
        return { status: 400, error: "Failed to create user" };
    } catch (error) {
        //console.error("🔴 ERROR in onAuthenticateUser:", error instanceof Error ? error.message : error);
        return { 
            status: 500, 
            error: error instanceof Error ? error.message : "Unknown authentication error"
        };
    }
};

// Update user profile information
export const updateUserProfile = async (data: { name?: string; email?: string }) => {
    try {
        const user = await currentUser();

        if (!user) {
            return { status: 403, error: "No authenticated user found" };
        }

        const userExist = await client.user.findUnique({
            where: {
                clerkId: user.id,
            },
        });

        if (!userExist) {
            return { status: 404, error: "User not found" };
        }

        // Update user profile
        const updatedUser = await client.user.update({
            where: {
                clerkId: user.id,
            },
            data: {
                name: data.name || userExist.name,
                email: data.email || userExist.email,
                updatedAt: new Date(),
            },
        });

        return { status: 200, user: updatedUser };
    } catch (error) {
        console.error("🔴 ERROR in updateUserProfile:", error);
        return { 
            status: 500, 
            error: error instanceof Error ? error.message : "Failed to update profile"
        };
    }
};

// Update user preferences
export const updateUserPreferences = async (preferences: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    autoSave?: boolean;
}) => {
    try {
        const user = await currentUser();

        if (!user) {
            return { status: 403, error: "No authenticated user found" };
        }

        const userExist = await client.user.findUnique({
            where: {
                clerkId: user.id,
            },
        });

        if (!userExist) {
            return { status: 404, error: "User not found" };
        }

        // Store preferences as JSON in a new field or use existing field
        // For now, we'll store it in a JSON field. You might need to add this to your schema
        const updatedUser = await client.user.update({
            where: {
                clerkId: user.id,
            },
            data: {
                // You might need to add a preferences field to your User model
                // preferences: preferences,
                updatedAt: new Date(),
            },
        });

        return { status: 200, user: updatedUser };
    } catch (error) {
        console.error("🔴 ERROR in updateUserPreferences:", error);
        return { 
            status: 500, 
            error: error instanceof Error ? error.message : "Failed to update preferences"
        };
    }
};

// Get user profile information
export const getUserProfile = async () => {
    try {
        const user = await currentUser();

        if (!user) {
            return { status: 403, error: "No authenticated user found" };
        }

        const userExist = await client.user.findUnique({
            where: {
                clerkId: user.id,
            },
        });

        if (!userExist) {
            return { status: 404, error: "User not found" };
        }

        return { status: 200, user: userExist };
    } catch (error) {
        console.error("🔴 ERROR in getUserProfile:", error);
        return { 
            status: 500, 
            error: error instanceof Error ? error.message : "Failed to get profile"
        };
    }
};

// Delete user account (dangerous operation)
export const deleteUserAccount = async () => {
    try {
        const user = await currentUser();

        if (!user) {
            return { status: 403, error: "No authenticated user found" };
        }

        // First, delete all user's projects
        await client.project.deleteMany({
            where: {
                userId: user.id,
            },
        });

        // Then delete the user
        await client.user.delete({
            where: {
                clerkId: user.id,
            },
        });

        return { status: 200, message: "Account deleted successfully" };
    } catch (error) {
        console.error("🔴 ERROR in deleteUserAccount:", error);
        return { 
            status: 500, 
            error: error instanceof Error ? error.message : "Failed to delete account"
        };
    }
};