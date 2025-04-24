import { JsonLdData } from '@/lib/seoUtils';

interface JsonLdScriptProps {
  data: JsonLdData | JsonLdData[];
}

/**
 * Component for adding structured data JSON-LD script to pages
 * @param data - JSON-LD structured data object or array of objects
 * @returns A script element with JSON-LD data
 */
export default function JsonLdScript({ data }: JsonLdScriptProps) {
  // Convert data to JSON string
  const jsonString = JSON.stringify(data);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}
