import { getStoreSetting } from "@/lib/supabase/store";
import { IconBrandWhatsapp } from "@tabler/icons-react";

export async function WhatsAppFloat() {
  const storeInfo = await getStoreSetting("store");
  const whatsappNumber = storeInfo?.whatsapp_number;

  if (!whatsappNumber) return null;

  const phoneNumber = whatsappNumber.replace(/[^\d]/g, "");
  const message = encodeURIComponent(
    `Hello ${storeInfo?.name ?? "Hobby Bangladesh"}! I have a question.`
  );
  const href = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="group fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform hover:scale-110"
    >
      <IconBrandWhatsapp className="size-7 text-white" stroke={1.5} />
      <span className="absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-sm text-background opacity-0 transition-opacity group-hover:opacity-100 md:block">
        Chat with us
      </span>
    </a>
  );
}