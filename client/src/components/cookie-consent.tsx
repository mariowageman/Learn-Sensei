import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always required
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    setPreferences({
      essential: true,
      analytics: true,
      marketing: true,
    });
    localStorage.setItem("cookie-consent", JSON.stringify({
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    }));
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    setPreferences({
      essential: true,
      analytics: false,
      marketing: false,
    });
    localStorage.setItem("cookie-consent", JSON.stringify({
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    }));
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("cookie-consent", JSON.stringify({
      ...preferences,
      timestamp: new Date().toISOString(),
    }));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t shadow-lg">
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground flex-1">
            <p>
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
              By clicking "Accept All", you consent to our use of cookies.{" "}
              <Link href="/cookie-policy" className="text-primary hover:underline">
                Read our Cookie Policy
              </Link>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  Customize
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Cookie Preferences</SheetTitle>
                </SheetHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center justify-between">
                        <span className="font-medium">Essential Cookies</span>
                        <input
                          type="checkbox"
                          checked={preferences.essential}
                          disabled
                          className="rounded border-gray-300"
                        />
                      </label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Required for basic website functionality. Cannot be disabled.
                      </p>
                    </div>
                    <div>
                      <label className="flex items-center justify-between">
                        <span className="font-medium">Analytics Cookies</span>
                        <input
                          type="checkbox"
                          checked={preferences.analytics}
                          onChange={(e) =>
                            setPreferences((prev) => ({
                              ...prev,
                              analytics: e.target.checked,
                            }))
                          }
                          className="rounded border-gray-300"
                        />
                      </label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Help us improve by tracking usage patterns.
                      </p>
                    </div>
                    <div>
                      <label className="flex items-center justify-between">
                        <span className="font-medium">Marketing Cookies</span>
                        <input
                          type="checkbox"
                          checked={preferences.marketing}
                          onChange={(e) =>
                            setPreferences((prev) => ({
                              ...prev,
                              marketing: e.target.checked,
                            }))
                          }
                          className="rounded border-gray-300"
                        />
                      </label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Used to deliver personalized advertisements.
                      </p>
                    </div>
                  </div>
                  <Button onClick={handleSavePreferences} className="w-full">
                    Save Preferences
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <Button variant="outline" size="sm" onClick={handleRejectAll}>
              Reject All
            </Button>
            <Button size="sm" onClick={handleAcceptAll}>
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
