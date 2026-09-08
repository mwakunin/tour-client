"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

export default function PageLoader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 800);

    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 1300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "bg-background fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out",
        isFading ? "pointer-events-none opacity-0" : "opacity-100"
      )}
    >
      {/* Centered wrapper for rings + logo */}
      <div
        style={{
          position: "relative",
          width: "180px",
          height: "180px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            inset: "-60px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(229,100,13,0.15) 0%, transparent 70%)",
            animation: "pulse 2s ease-in-out infinite",
          }}
        />

        {/* Outer rotating ring */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "1.5px solid transparent",
            borderTopColor: "rgba(229,100,13,0.8)",
            borderRightColor: "rgba(229,100,13,0.3)",
            animation: "spin 1.2s linear infinite",
          }}
        />

        {/* Inner counter-rotating ring */}
        <div
          style={{
            position: "absolute",
            inset: "15px",
            borderRadius: "50%",
            border: "1px solid transparent",
            borderBottomColor: "rgba(229,100,13,0.5)",
            borderLeftColor: "rgba(229,100,13,0.2)",
            animation: "spin-reverse 1.8s linear infinite",
          }}
        />

        {/* Logo - static, no scale/position animation so it doesn't jump */}
        <div
          style={{
            position: "relative",
            width: "110px",
            height: "110px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <Image
            src="/leopard-paw-lossless.webp"
            alt="Footloose Adventures"
            width={110}
            height={110}
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
      </div>

      {/* Brand name + dots */}
      <div
        className="font-serif"
        style={{
          marginTop: "40px",
          textAlign: "center",
          animation: "fadeInUp 0.8s ease forwards",
        }}
      >
        <p
          className="text-primary/90"
          style={{
            fontSize: "11px",
            letterSpacing: "4px",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Footloose Adventures
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "6px",
            marginTop: "16px",
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-primary/70"
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                animation: `dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          to { transform: rotate(-360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.3); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
