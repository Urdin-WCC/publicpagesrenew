import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

interface SocialLinksWidgetProps {
  title?: string;
  config?: {
    links?: Array<{ label: string; url: string; icon?: React.ReactNode }>;
  };
}

const defaultLinks = [
  { label: "Twitter", url: "https://twitter.com/", icon: null },
  { label: "LinkedIn", url: "https://linkedin.com/", icon: null },
  { label: "GitHub", url: "https://github.com/", icon: null },
];

export default function SocialLinksWidget({
  title = "Síguenos en Redes Sociales",
  config
}: SocialLinksWidgetProps) {
  const links = config?.links && config.links.length > 0 ? config.links : defaultLinks;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {links.map((link, i) => (
            <li key={i}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-500 hover:underline space-x-2"
              >
                {link.icon && <span>{link.icon}</span>}
                <span>{link.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
