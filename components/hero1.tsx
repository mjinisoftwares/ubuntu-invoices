import { ArrowRight, ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Image {
  src: string;
  alt: string;
  srcDark?: string;
}
interface ButtonItem {
  text: string;
  url: string;
  icon?: React.ReactNode;
}
interface Buttons {
  primary?: ButtonItem;
  secondary?: ButtonItem;
}
interface BadgeProps {
  text: string;
  announcement?: string;
  url?: string;
}

interface HeroBasicProps {
  badge?: BadgeProps;
  heading: string;
  description: string;
  buttons?: Buttons;
  image: Image;
  className?: string;
}

type Hero1Props = HeroBasicProps;
type Props = Partial<Hero1Props>;

const defaultProps: Hero1Props = {
  badge: {
    text: "Ubuntu Logistics SaaS",
    announcement: "Invoice & Quotation Generator System",
  },
  heading: "Smart Invoice & Quotation Generator for Ubuntu Logistics",
  description:
    "Create, manage, and export professional invoices and quotations in seconds. Built for logistics, transport, and service-based businesses with MPESA integration, PDF export, and automated history tracking.",
  buttons: {
    primary: {
      text: "Create Invoice",
      url: "/dashboard/invoices",
    },
    secondary: {
      text: "Create Quotation",
      url: "/dashboard/quotations",
    },
  },
  image: {
    src: "/ubuntu.webp",
    srcDark: "/ubuntu.webp",
    alt: "Ubuntu Logistics Invoice and Quotation System",
  },
};

const Hero1 = (props: Props) => {
  const { badge, heading, description, buttons, image, className } = {
    ...defaultProps,
    ...props,
  };

  return (
    <section className={cn("", className)}>
      <div className="container mx-auto px-4 md:px-8 lg:px-16 min-h-screen">
        <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
          {/* TEXT SIDE */}
          <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left">
            {badge && (
              <Badge variant="outline">
                {badge.text}
                <ArrowUpRight className="size-4" />
              </Badge>
            )}

            <h1 className="max-w-xl text-2xl font-bold text-pretty md:text-3xl lg:max-w-3xl ">
              {heading}
            </h1>

            <p className="max-w-5xl text-balance text-muted-foreground ">
              {description}
            </p>

            <div className="flex w-full flex-col justify-center gap-2 sm:flex-row lg:justify-start">
              {buttons?.primary && (
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <a href={buttons.primary.url}>
                    {buttons.primary.text}
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
              )}

              {buttons?.secondary && (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <a href={buttons.secondary.url}>
                    {buttons.secondary.text}
                  </a>
                </Button>
              )}
            </div>
          </div>

          <div className="">
            <Image
              src={image.src}
              alt={image.alt}
              width={500}
              height={500}
              className="rounded-full border border-border object-cover object-top"
            />
          </div>

     
        </div>
      </div>
    </section>
  );
};

export { Hero1 };