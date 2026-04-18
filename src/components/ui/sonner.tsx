"use client";

import {
    CircleCheckIcon,
    InfoIcon,
    Loader2Icon,
    OctagonXIcon,
    TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme();

    return (
        <>
            {/* Inject glass toast styles globally */}
            <style>{`
        [data-sonner-toaster] [data-sonner-toast] {
          --tw-ring-shadow: none;
          background: rgba(255, 255, 255, 0.88) !important;
          backdrop-filter: blur(24px) saturate(1.6) !important;
          -webkit-backdrop-filter: blur(24px) saturate(1.6) !important;
          border: 1px solid rgba(255, 255, 255, 0.72) !important;
          border-radius: 14px !important;
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.10),
            0 2px 8px rgba(0, 0, 0, 0.06),
            inset 0 1.5px 1px rgba(255, 255, 255, 0.95),
            inset 0 -1px 0 rgba(0, 0, 0, 0.04) !important;
          padding: 12px 14px !important;
          gap: 10px !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          color: rgb(39 39 42) !important; /* zinc-800 */
          min-width: 280px !important;
          max-width: 380px !important;
        }

        /* Dark mode */
        .dark [data-sonner-toaster] [data-sonner-toast] {
          background: rgba(24, 24, 27, 0.92) !important;
          border: 1px solid rgba(63, 63, 70, 0.60) !important;
          color: rgb(250 250 250) !important; /* zinc-50 */
        }

        /* Description text */
        [data-sonner-toaster] [data-sonner-toast] [data-description] {
          color: rgb(113 113 122) !important; /* zinc-500 */
          font-size: 11.5px !important;
          font-weight: 400 !important;
          margin-top: 2px !important;
        }
        .dark [data-sonner-toaster] [data-sonner-toast] [data-description] {
          color: rgb(161 161 170) !important;
        }

        /* Action / close buttons */
        [data-sonner-toaster] [data-sonner-toast] [data-button] {
          border-radius: 8px !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          padding: 3px 10px !important;
          height: 24px !important;
          background: rgba(39, 39, 42, 0.90) !important;
          color: white !important;
          border: none !important;
        }
        .dark [data-sonner-toaster] [data-sonner-toast] [data-button] {
          background: rgba(250, 250, 250, 0.15) !important;
          color: rgb(250 250 250) !important;
        }
        [data-sonner-toaster] [data-sonner-toast] [data-close-button] {
          background: rgba(0,0,0,0.05) !important;
          border: 1px solid rgba(0,0,0,0.07) !important;
          color: rgb(113 113 122) !important;
          border-radius: 6px !important;
          top: 8px !important;
          right: 8px !important;
        }
        .dark [data-sonner-toaster] [data-sonner-toast] [data-close-button] {
          background: rgba(255,255,255,0.06) !important;
          border-color: rgba(255,255,255,0.10) !important;
          color: rgb(161 161 170) !important;
        }

        /* Icon colours per variant */
        [data-sonner-toast][data-type="success"] [data-icon] { color: rgb(34 197 94) !important; }
        [data-sonner-toast][data-type="error"]   [data-icon] { color: rgb(239 68 68) !important; }
        [data-sonner-toast][data-type="warning"] [data-icon] { color: rgb(245 158 11) !important; }
        [data-sonner-toast][data-type="info"]    [data-icon] { color: rgb(59 130 246) !important; }

        /* Coloured left-border accent per type */
        [data-sonner-toast][data-type="success"] {
          border-left: 3px solid rgb(34 197 94) !important;
        }
        [data-sonner-toast][data-type="error"] {
          border-left: 3px solid rgb(239 68 68) !important;
        }
        [data-sonner-toast][data-type="warning"] {
          border-left: 3px solid rgb(245 158 11) !important;
        }
        [data-sonner-toast][data-type="info"] {
          border-left: 3px solid rgb(59 130 246) !important;
        }

        /* Loading spinner stays zinc */
        [data-sonner-toast][data-type="loading"] [data-icon] { color: rgb(113 113 122) !important; }

        /* Progress / timer bar at the bottom */
        [data-sonner-toaster] [data-sonner-toast] [data-close-button] + [data-content] ~ [data-progress-bar] {
          border-radius: 0 0 14px 14px !important;
          background: rgba(161, 161, 170, 0.25) !important;
          height: 2px !important;
        }
      `}</style>

            <Sonner
                theme={theme as ToasterProps["theme"]}
                className="toaster group"
                position="bottom-right"
                offset={20}
                gap={10}
                richColors={false}
                icons={{
                    success: <CircleCheckIcon className="size-4" />,
                    info:    <InfoIcon className="size-4" />,
                    warning: <TriangleAlertIcon className="size-4" />,
                    error:   <OctagonXIcon className="size-4" />,
                    loading: <Loader2Icon className="size-4 animate-spin" />,
                }}
                toastOptions={{
                    // Duration: success/info = 4s, error stays until dismissed
                    duration: 4000,
                    classNames: {
                        toast: "group/toast",
                        title: "font-semibold",
                        description: "opacity-80",
                    },
                }}
                {...props}
            />
        </>
    );
};

export { Toaster };
