const fs = require('fs');
let s = fs.readFileSync('src/app/api/orders/notify/route.ts','utf8');
s = s.replace("import nodemailer from \"nodemailer\";\n", "");
s = s.replace("const transporter = nodemailer.createTransport", "const transporter = require('nodemailer').createTransport");
fs.writeFileSync('src/app/api/orders/notify/route.ts', s);
