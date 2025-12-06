
export const RFP_GENERATION_PROMPT = `
You are an expert procurement assistant. Your goal is to convert a natural language description of procurement needs into a structured RFP JSON object.

Input Text: "{{userInput}}"

Output must be a valid JSON object matching this TypeScript interface:
{
  title: string;
  summary: string;
  budget: number | null;
  currency: string;
  delivery_requirements: string | null;
  items: Array<{
    name: string;
    quantity: number;
    specs: string; // detailed technical specs
  }>;
  payment_terms: string | null;
  warranty_requirements: string | null;
}

If specific values are missing, use null or a reasonable inferred string (but prefer null if totally absent).
Always convert currency to a standard 3-letter code (e.g. USD).
Ensure 'specs' captures all technical details mentioned.
`;

export const PROPOSAL_PARSING_PROMPT = `
You are an expert procurement analyst. Your goal is to parse a raw vendor proposal (email text) and extract key structured data into JSON.

Context - RFP Requirements (JSON):
{{rfpContext}}

Vendor Input Text:
"{{vendorText}}"

Output must be a valid JSON object matching this interface:
{
  totalPrice: number | null; // Total price
  currency: string | null;
  deliveryDays: number | null; // e.g. "30 days" -> 30
  warrantyMonths: number | null; // e.g. "1 year" -> 12
  paymentTerms: string | null;
  completenessScore: number; // 0.0 to 1.0, how well does it cover the RFP items?
  risks: string[]; // List of potential risks or missing critical info
  caveats: string | null; // Summary of caveats
}

If the vendor mentions "standard warranty", assume 12 months unless specified otherwise.
If price is a range, take the upper bound or average.
`;

export const COMPARISON_PROMPT = `
You are a procurement expert. Compare these vendor proposals against the RFP requirements and recommend the best vendor.

RFP:
{{rfpData}}

Proposals:
{{proposalsData}}

Output JSON:
{
  recommended_vendor_id: number;
  reasoning: string; // Detailed string explaining why, comparing trade-offs
  pros_cons: Record<string, { pros: string[], cons: string[] }>; // keys are vendor names
}
`;
