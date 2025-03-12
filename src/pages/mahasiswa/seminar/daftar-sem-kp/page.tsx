import DashboardLayout from "@/components/globals/layouts/dashboard-layout";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import {
  Building2Icon,
  CalendarIcon,
  ChevronRight,
  ClipboardIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Stepper from "@/components/mahasiswa/seminar/stepper";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function MahasiswaSeminarDaftarPage() {
  interface entry {
    id: number;
    status: string;
    company: string;
    date: string;
    historyStatus: string;
    title: string;
  }

  const entry = [
    {
      id: 2,
      status: "Baru",
      company: "PT RAPP",
      date: "2025-02-28",
      historyStatus: "Proses Validasi Berkas",
      title: "Pendaftaran Sem-KP #2",
    },
    {
      id: 1,
      status: "Gagal",
      company: "PT Telkom",
      date: "2025-01-15",
      historyStatus: "Gagal",
      title: "Pendaftaran Sem-KP #1",
    },
  ];
  const infoPengajuanSeminar = {
    step: 0,
  };
  // Filter entries based on status
  const activeEntries = entry.filter((entry) => entry.status !== "Gagal");
  const previousEntries = entry.filter((entry) => entry.status === "Gagal");

  const navigate = useNavigate();

  const KPCard = ({ entry }: { entry: entry }) => (
    <Card className="bg-purple-800 text-white">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap gap-4 items-center text-sm">
          <div className="flex items-center gap-2">
            <ClipboardIcon className="h-4 w-4" />
            <span>Status kp: {entry.status}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2Icon className="h-4 w-4" />
            <span>{entry.company}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>{entry.date}</span>
          </div>
          <div className="ml-auto text-right">
            Riwayat: {entry.historyStatus}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex justify-between items-center pt-2">
        <CardTitle className="text-lg font-semibold">{entry.title}</CardTitle>
        {entry.status === "Gagal" && (
          <Dialog>
            <DialogTrigger asChild>
              <button className="px-3 py-1.5 bg-white text-purple-800 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-1">
                View
                <ChevronRight className="h-4 w-4" />
              </button>
            </DialogTrigger>
            <DialogContent className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-red-700">
                  Pengajuan Pendaftaran Kerja Praktik Anda{" "}
                  <span className="text-red-700">Ditolak!</span>
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-2 text-sm">
                <div>
                  <span className="font-semibold">
                    Nama Instansi Pengajuan:
                  </span>
                  <p className="text-gray-700">{entry.company}</p>
                </div>
                <div>
                  <span className="font-semibold">Alur Progress Ditolak:</span>
                  <p className="text-gray-700">Surat pengantar dan jawaban</p>
                </div>
                <div>
                  <span className="font-semibold">Waktu Ditolak:</span>
                  <p className="text-gray-700">
                    Senin / 09-03-2025 / 07.00 WIB
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <h2 className="text-red-700 font-semibold">Catatan:</h2>
                <Textarea
                  placeholder="melewati masa waktu pendaftaran kp"
                  readOnly
                  className="w-full text-black border border-red-900 resize-none bg-white"
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      <DashboardLayout>
        <h1 className="text-2xl font-bold">Seminar Kerja Praktik</h1>
        <Card>
          <CardHeader>
            <CardTitle>Form Pendaftaran Seminar Kerja Praktik </CardTitle>
            <CardDescription>
              Silakan Lakukan Pendaftaran Seminar Kerja Praktik Pada Tombol
              Dibawah ini:
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <InteractiveHoverButton className="text-sm rounded-md">
              Ajukan Pendaftaran
            </InteractiveHoverButton>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detail Riwayat</CardTitle>
          </CardHeader>

          {activeEntries.length > 0 && (
            <CardContent>
              <CardDescription className="py-2 font-bold">
                Aktif
              </CardDescription>
              <div className="flex flex-col gap-4">
                {activeEntries.map((entry) => (
                  <KPCard key={entry.id} entry={entry} />
                ))}
              </div>
            </CardContent>
          )}

          {previousEntries.length > 0 && (
            <CardContent>
              <CardDescription className="py-2 font-bold">
                Riwayat Sebelumnya
              </CardDescription>
              <div className="flex flex-col gap-4">
                {previousEntries.map((entry) => (
                  <KPCard key={entry.id} entry={entry} />
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        <Separator className="mt-96" />

        <h1 className="text-2xl font-bold">Seminar Kerja Praktik</h1>
        <Card>
          <CardHeader>
            <CardTitle>Progress Seminar Kerja Praktik</CardTitle>
            <CardDescription>
              Pengajuan pendaftaran kerja praktik anda dalam proses kelengkapan
              berkas......
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Stepper activeStep={infoPengajuanSeminar.step} />
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="flex border border-black rounded-full px-7 py-2 gap-4 items-center">
              <p className="text-xs">
                Silahkan lanjut Untuk Validasi Kelengkapan Berkas !
              </p>
              <Button
                className="text-xs rounded-full px-4"
                onClick={() => navigate("/mahasiswa/seminar/validasi-berkas")}
              >
                Lanjut
              </Button>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detail Riwayat</CardTitle>
          </CardHeader>

          {activeEntries.length > 0 && (
            <CardContent>
              <CardDescription className="py-2 font-bold">
                Aktif
              </CardDescription>
              <div className="flex flex-col gap-4">
                {activeEntries.map((entry) => (
                  <KPCard key={entry.id} entry={entry} />
                ))}
              </div>
            </CardContent>
          )}

          {previousEntries.length > 0 && (
            <CardContent>
              <CardDescription className="py-2 font-bold">
                Riwayat Sebelumnya
              </CardDescription>
              <div className="flex flex-col gap-4">
                {previousEntries.map((entry) => (
                  <KPCard key={entry.id} entry={entry} />
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        <Separator className="mt-96" />

        <h1 className="text-2xl font-bold">Seminar Kerja Praktik</h1>

        <div className="flex gap-2 w-full">
          <Alert className="border-red-100 bg-red-50 dark:border-red-900 dark:bg-red-950/50 transition-colors">
            <TriangleAlertIcon className="size-4 text-red-600 dark:text-red-400" />
            <AlertTitle className="text-base font-semibold text-red-800 dark:text-red-200">
              Maaf, pendaftaran seminar kerja praktik kamu DITOLAK
            </AlertTitle>
            <AlertDescription className="text-red-600 dark:text-red-400 flex flex-col gap-2">
              <p>
                Silakan Lakukan Pendaftaran Ulang Kerja Praktik. Sesuai Perintah
                !
              </p>
            </AlertDescription>
          </Alert>

          <div className="w-full">
            <h2 className="text-red-700 font-semibold">Alasan ditolak:</h2>
            <Textarea
              placeholder="Masa Waktu Seminar Periode ini Telah Habis, Jika ingin 
melanjutkan nya , silahkan daftar ulang Anda."
              className="w-full text-black border border-red-900 resize-none"
              readOnly
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Form Pendaftaran Seminar Kerja Praktik </CardTitle>
            <CardDescription>
              Silakan Lakukan Pendaftaran Seminar Kerja Praktik Pada Tombol
              Dibawah ini:
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <InteractiveHoverButton className="text-sm rounded-md">
              Ajukan Pendaftaran
            </InteractiveHoverButton>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Detail Riwayat</CardTitle>
          </CardHeader>

          {activeEntries.length > 0 && (
            <CardContent>
              <CardDescription className="py-2 font-bold">
                Aktif
              </CardDescription>
              <div className="flex flex-col gap-4">
                {activeEntries.map((entry) => (
                  <KPCard key={entry.id} entry={entry} />
                ))}
              </div>
            </CardContent>
          )}

          {previousEntries.length > 0 && (
            <CardContent>
              <CardDescription className="py-2 font-bold">
                Riwayat Sebelumnya
              </CardDescription>
              <div className="flex flex-col gap-4">
                {previousEntries.map((entry) => (
                  <KPCard key={entry.id} entry={entry} />
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      </DashboardLayout>
    </>
  );
}
