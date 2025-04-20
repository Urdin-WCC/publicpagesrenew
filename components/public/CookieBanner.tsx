"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CookieBannerProps {
  text: string;
  privacyPolicySlug?: string;
  privacyPolicyTitle?: string;
}

export default function CookieBanner({
  text,
  privacyPolicySlug,
  privacyPolicyTitle,
}: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookiesAccepted = localStorage.getItem("cookiesAccepted");
    if (!cookiesAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    // Set cookie acceptance in local storage
    localStorage.setItem("cookiesAccepted", "true");
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 text-white p-4 shadow-lg z-50">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm">{text}</p>
          {privacyPolicySlug && privacyPolicyTitle && (
            <p className="text-sm mt-1">
              <Link
                href={`/${privacyPolicySlug}`}
                className="text-blue-300 hover:text-blue-100 underline"
              >
                {privacyPolicyTitle}
              </Link>
            </p>
          )}
        </div>
        <Button
          onClick={handleAccept}
          className="whitespace-nowrap bg-blue-500 hover:bg-blue-600"
        >
          Aceptar
        </Button>
      </div>
    </div>
  );
}
