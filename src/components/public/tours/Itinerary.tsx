import { cn } from "@/lib/utils/cn";
import type { ItineraryDay } from "@/types/tour";

interface ItineraryProps {
  items: ItineraryDay[];
}

// interface ItineraryProps {
//   items: Array<{
//     day: string;
//     title: string;
//     activities: string;
//     accommodation?: string;
//     meals?: string;
//   }>;
// }

export default function Itinerary({ items }: ItineraryProps) {
  return (
    <div>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex gap-6">
            <div className="relative flex shrink-0 flex-col items-center">
              <div className="border-primary bg-surface-container-lowest relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full border-2" />
              {!isLast && (
                <div
                  className="bg-outline-variant absolute top-5 -bottom-3 left-1/2 w-px -translate-x-1/2"
                  aria-hidden="true"
                />
              )}
            </div>

            <div className={cn("flex-1", !isLast && "pb-8")}>
              <div className="bg-primary text-on-primary mb-2 inline-block rounded-full px-3 py-1 text-sm font-semibold">
                {item.day}
              </div>
              <h4 className="text-on-surface mb-2 font-serif text-lg font-bold">{item.title}</h4>
              <p className="text-on-surface-variant mb-3">{item.activities}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                {item.accommodation && (
                  <div className="text-on-surface-variant">
                    <span className="font-medium">Accommodation:</span> {item.accommodation}
                  </div>
                )}
                {item.meals && (
                  <div className="text-on-surface-variant">
                    <span className="font-medium">Meals:</span> {item.meals}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
