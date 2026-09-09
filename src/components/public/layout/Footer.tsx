import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, X, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-surface border-outline-variant border-t">
      <div className="container mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr] lg:gap-8">
          {/* Brand */}
          <div>
            <Image
              src="/LOGO_FULL.webp"
              alt="Footloose Adventures"
              width={1700}
              height={1343}
              className="h-28 w-auto object-contain"
            />
            <p className="text-headline-sm text-on-surface mt-5 max-w-xs">
              Journeys across Africa, planned by people who call it home.
            </p>
            <div className="mt-6 flex space-x-4">
              <a
                href="https://www.facebook.com/share/1H7injwZNh/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://www.instagram.com/footloose_adventureske?igsh=aTljbWRmb214MXJy&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                <Instagram size={20} />
              </a>
              {/* <a
                href="https://twitter.com/footloose_adv"
                target="_blank"
                rel="noopener noreferrer"
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                <X size={20} />
              </a> */}
              {/* lucide-react has no Threads glyph, so this is an inline brand
                  SVG — the same approach the contact page uses for its socials. */}
              <a
                href="https://www.threads.com/@footloose_adventureske?igshid=NTc4MTIwNjQ2YQ=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Threads"
                className="text-on-surface-variant hover:text-primary transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.321.142 1.49.7 2.58 1.761 3.154 3.07.797 1.82.871 4.79-1.548 7.158-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221Z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="label-caps text-on-surface-variant mb-4">Quick Links</h4>
            <ul className="text-on-surface space-y-2 text-sm">
              <li>
                <Link href="/tours" className="hover:text-primary transition-colors">
                  Tours
                </Link>
              </li>
              <li>
                <Link href="/destinations" className="hover:text-primary transition-colors">
                  Destinations
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular destinations */}
          <div>
            <h4 className="label-caps text-on-surface-variant mb-4">Popular Destinations</h4>
            <ul className="text-on-surface space-y-2 text-sm">
              <li>
                <Link
                  href="/destinations//masai-mara-national-reserve"
                  className="hover:text-primary transition-colors"
                >
                  Maasai Mara
                </Link>
              </li>
              <li>
                <Link
                  href="/destinations/amboseli-national-park"
                  className="hover:text-primary transition-colors"
                >
                  Amboseli
                </Link>
              </li>
              <li>
                <Link
                  href="/destinations//tsavo-national-parks"
                  className="hover:text-primary transition-colors"
                >
                  Tsavo
                </Link>
              </li>
              <li>
                <Link
                  href="/destinations/samburu-national-reserve"
                  className="hover:text-primary transition-colors"
                >
                  Samburu
                </Link>
              </li>
              <li>
                <Link
                  href="/destinations/laikipia"
                  className="hover:text-primary transition-colors"
                >
                  Laikipia
                </Link>
              </li>
              <li>
                <Link
                  href="/destinations/lake-nakuru-national-park"
                  className="hover:text-primary transition-colors"
                >
                  Lake Nakuru
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="label-caps text-on-surface-variant mb-4">Contact Us</h4>
            <ul className="text-on-surface space-y-3 text-sm">
              <li className="flex items-start">
                <MapPin size={16} className="text-primary mt-1 mr-2 shrink-0" />
                <span>Nairobi, Kenya</span>
              </li>
              <li className="flex items-center">
                <Phone size={16} className="text-primary mr-2 shrink-0" />
                <a href="tel:+254742060624" className="hover:text-primary transition-colors">
                  +254 742 060 624
                </a>
              </li>
              <li className="flex items-center">
                <Mail size={16} className="text-primary mr-2 shrink-0" />
                <a
                  href="mailto:info@footlooseadventures.co.ke"
                  className="hover:text-primary whitespace-nowrap transition-colors"
                >
                  info@footlooseadventures.co.ke
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="border-outline-variant mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-on-surface-variant text-sm">
            &copy; {new Date().getFullYear()} Footloose Adventures. All rights reserved.
          </p>

          <div className="text-on-surface-variant flex space-x-4 text-sm">
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms-of-service" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
