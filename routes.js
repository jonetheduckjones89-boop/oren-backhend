import express from "express";
import { z } from "zod";
import { supabase } from "./db.js";
import { sendClinicEmail } from "./mailer.js";

const router = express.Router();

// Input Validation Schema
const leadSchema = z.object({
    clinic_name: z.string().trim().optional(),
    clinic_type: z.string().trim().optional(),
    email: z.string().trim().email("Invalid email format"),
    website: z.string().trim().optional()
});

router.post("/lead", async (req, res) => {
    try {
        // 1. Validate Input
        const parseResult = leadSchema.safeParse(req.body);

        if (!parseResult.success) {
            // Return first error message friendly
            const errorMessage = parseResult.error.errors[0]?.message || "Invalid input";
            return res.status(400).json({ error: errorMessage });
        }

        const { clinic_name, clinic_type, email, website } = parseResult.data;

        // 2. Database Write (Atomic & Safe)
        const { error: dbError } = await supabase
            .from("clinic_leads")
            .insert([
                {
                    clinic_name,
                    clinic_type,
                    email,
                    website,
                    created_at: new Date().toISOString() // Ensure timestamp
                }
            ]);

        if (dbError) {
            console.error("Supabase Write Error:", dbError);
            // Do NOT send email if DB write fails
            return res.status(500).json({ error: "Failed to save lead info." }); // Don't leak DB details
        }

        // 3. Send Email (Reliability Wrapper)
        try {
            await sendClinicEmail({
                clinic_name,
                clinic_type,
                email
            });
        } catch (emailError) {
            console.error("Email Send Failed (Lead saved):", emailError);
            // We still return 200 because the lead was legally captured. 
            // The user gets a success message, the clinic just misses one auto-responder (better than losing the lead).
        }

        // 4. Success Response
        return res.status(200).json({ success: true, message: "Info received" });

    } catch (err) {
        console.error("Unexpected Server Error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
