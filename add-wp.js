const fs = require("fs");
let s = fs.readFileSync("src/components/bulk-order/bulk-order-form.tsx", "utf8");
if (s.indexOf("WhatsAppLogo") === -1) {
  s = "import { WhatsAppLogo } from '@/components/icons/whatsapp-logo';\n" + s;
  fs.writeFileSync("src/components/bulk-order/bulk-order-form.tsx", s);
}
