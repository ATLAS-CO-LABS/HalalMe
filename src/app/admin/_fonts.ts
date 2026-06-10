import { Poppins } from "next/font/google";

// Platform headline face — matches the consumer app's Poppins headings so the
// admin reads as part of the same brand system.
export const display = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});
