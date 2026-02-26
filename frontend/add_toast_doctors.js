const fs = require('fs');
let c = fs.readFileSync('src/app/doctors/page.tsx', 'utf8');
c = c.replace(
  'import { useRouter } from "next/navigation";',
  'import { useRouter } from "next/navigation";\nimport toast from "react-hot-toast";'
);
c = c.replace(
  'router.push("/appointments");',
  'toast.success("Appointment booked successfully!");\n      router.push("/appointments");'
);
c = c.replace(
  'setError(null); setSuccess(null); setBooking(true);',
  'setBooking(true);'
);
fs.writeFileSync('src/app/doctors/page.tsx', c);
console.log('Done');

