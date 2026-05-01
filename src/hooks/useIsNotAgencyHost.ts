import { useEffect, useState } from "react";

/**
 * Returns true when the site is being viewed on the thenotagency.com
 * custom domain (or its www variant). Used to swap the homepage and
 * hide the Eight-Six navigation chrome for that brand.
 */
export const useIsNotAgencyHost = (): boolean => {
  const [isNotAgency, setIsNotAgency] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return checkHost(window.location.hostname);
  });

  useEffect(() => {
    setIsNotAgency(checkHost(window.location.hostname));
  }, []);

  return isNotAgency;
};

function checkHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === "thenotagency.com" || h === "www.thenotagency.com";
}
