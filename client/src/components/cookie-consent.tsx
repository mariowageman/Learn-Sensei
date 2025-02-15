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

// Create a function to reset cookie consent that can be imported by other components
export function resetCookieConsent() {
  localStorage.removeItem("cookie-consent");
  // Force a page reload to show the banner
  window.location.reload();
}

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
    <>
      {/* Semi-transparent overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />

      {/* Cookie consent banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t shadow-2xl">
        <div className="container max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="text-sm text-muted-foreground flex-1 leading-relaxed">
              <p>
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                By clicking "Accept All", you consent to our use of cookies.{" "}
                <Link href="/cookie-policy">
                  <a className="text-primary hover:underline font-medium">
                    Read our Cookie Policy
                  </a>
                </Link>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    Customize
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Cookie Preferences</SheetTitle>
                  </SheetHeader>
                  <div className="py-6 space-y-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="flex items-center justify-between">
                          <span className="font-medium">Essential Cookies</span>
                          <input
                            type="checkbox"
                            checked={preferences.essential}
                            disabled
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Required for basic website functionality. Cannot be disabled.
                        </p>
                      </div>
                      <div className="space-y-2">
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
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </label>
                        <p className="text-sm text-muted-foreground">
                          Help us improve by tracking usage patterns.
                        </p>
                      </div>
                      <div className="space-y-2">
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
                            className="h-4 w-4 rounded border-gray-300"
                          />
                        </label>
                        <p className="text-sm text-muted-foreground">
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRejectAll}
                className="w-full sm:w-auto"
              >
                Reject All
              </Button>
              <Button 
                size="sm" 
                onClick={handleAcceptAll}
                className="w-full sm:w-auto bg-[#3F3EED] hover:bg-[#3F3EED]/90"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}