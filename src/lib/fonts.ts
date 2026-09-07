export type FontChoice = "glamour" | "classic" | "editorial" | "soft";

export const FONT_PRESETS: Record<
  FontChoice,
  { label: string; display: string; body: string; googleHref: string }
> = {
  glamour: {
    label: "Glamour (combina com a logo — Bodoni + Manrope)",
    display: '"Bodoni Moda", serif',
    body: '"Manrope", sans-serif',
    googleHref:
      "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,500;0,600;1,400&family=Manrope:wght@400;500;600;700&display=swap",
  },
  classic: {
    label: "Clássica (Cormorant + Manrope)",
    display: '"Cormorant Garamond", serif',
    body: '"Manrope", sans-serif',
    googleHref:
      "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Manrope:wght@400;500;600;700&display=swap",
  },
  editorial: {
    label: "Editorial (Playfair + Inter)",
    display: '"Playfair Display", serif',
    body: '"Inter", sans-serif',
    googleHref:
      "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600;700&display=swap",
  },
  soft: {
    label: "Delicada (Marcellus + Poppins)",
    display: '"Marcellus", serif',
    body: '"Poppins", sans-serif',
    googleHref:
      "https://fonts.googleapis.com/css2?family=Marcellus&family=Poppins:wght@300;400;500;600&display=swap",
  },
};

export function getFontPreset(choice: string | null | undefined) {
  return FONT_PRESETS[(choice as FontChoice) ?? "glamour"] ?? FONT_PRESETS.glamour;
}
