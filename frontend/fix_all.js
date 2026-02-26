const fs = require('fs');
const files = [
  'src/app/auth/login/page.tsx',
  'src/app/auth/register/page.tsx',
  'src/app/doctors/page.tsx',
  'src/app/doctor/page.tsx',
  'src/app/profile/page.tsx',
  'src/app/appointments/page.tsx',
  'src/app/admin/page.tsx',
  'src/app/page.tsx',
  'src/components/Navbar.tsx',
];

files.forEach(f => {
  if (!fs.existsSync(f)) { console.log('MISSING: ' + f); return; }
  let c = fs.readFileSync(f, 'utf8');
  let orig = c;

  c = c.split('abel className').join('abel className');
  c = c.split('abel').join('abel');
  c = c.replace(/<(\w+) class=/g, '<$1 className=');
  c = c.replace(/} catch \(err\) {/g, '} catch (err: any) {');
  c = c.replace(/const formatDate = \(iso\) =>/g, 'const formatDate = (iso: string) =>');
  c = c.replace(/const \[error, setError\] = useState\(null\)/g, 'const [error, setError] = useState<string | null>(null)');
  c = c.replace(/const \[success, setSuccess\] = useState\(null\)/g, 'const [success, setSuccess] = useState<string | null>(null)');
  c = c.replace(/const \[markingId, setMarkingId\] = useState\(null\)/g, 'const [markingId, setMarkingId] = useState<number | null>(null)');
  c = c.replace(/const \[cancellingId, setCancellingId\] = useState\(null\)/g, 'const [cancellingId, setCancellingId] = useState<number | null>(null)');
  c = c.replace(/const \[bookingDoctor, setBookingDoctor\] = useState\(null\)/g, 'const [bookingDoctor, setBookingDoctor] = useState<any>(null)');
  c = c.replace(/const \[ratingApptId, setRatingApptId\] = useState\(null\)/g, 'const [ratingApptId, setRatingApptId] = useState<number | null>(null)');
  c = c.replace(/const \[role, setRole\] = useState\(null\)/g, 'const [role, setRole] = useState<string | null>(null)');
  c = c.replace(/const \[user, setUser\] = useState\(null\)/g, 'const [user, setUser] = useState<any>(null)');
  c = c.replace(/const \[stats, setStats\] = useState\(null\)/g, 'const [stats, setStats] = useState<any>(null)');
  c = c.replace(/const \[appointments, setAppointments\] = useState\(\[\]\)/g, 'const [appointments, setAppointments] = useState<any[]>([])');
  c = c.replace(/const \[doctors, setDoctors\] = useState\(\[\]\)/g, 'const [doctors, setDoctors] = useState<any[]>([])');
  c = c.replace(/const \[filtered, setFiltered\] = useState\(\[\]\)/g, 'const [filtered, setFiltered] = useState<any[]>([])');
  c = c.replace(/const \[users, setUsers\] = useState\(\[\]\)/g, 'const [users, setUsers] = useState<any[]>([])');
  c = c.replace(/const handleMarkDone = async \(id\)/g, 'const handleMarkDone = async (id: number)');
  c = c.replace(/const handleCancel = async \(id\)/g, 'const handleCancel = async (id: number)');
  c = c.replace(/const handleSubmitRating = async \(appt\)/g, 'const handleSubmitRating = async (appt: any)');
  c = c.replace(/const handleLogin = async \(e\)/g, 'const handleLogin = async (e: React.FormEvent)');
  c = c.replace(/const handleRegister = async \(e\)/g, 'const handleRegister = async (e: React.FormEvent)');
  c = c.split('=== "done"').join('=== "completed"');

  if (c !== orig) {
    fs.writeFileSync(f, c);
    console.log('FIXED: ' + f);
  } else {
    console.log('OK: ' + f);
  }
});

