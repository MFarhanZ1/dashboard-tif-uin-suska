import { FC, useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Stepper from "@/components/mahasiswa/seminar/stepper";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import Status from "@/components/mahasiswa/seminar/status";
import InfoCard from "../informasi-seminar";
import DocumentCard from "../formulir-dokumen";
import { toast } from "@/hooks/use-toast";
import APISeminarKP from "@/services/api/mahasiswa/seminar-kp.service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Type definitions
type StepStatus = "belum" | "validasi" | "ditolak" | "diterima";
type DocumentStatus = "default" | "Terkirim" | "Divalidasi" | "Ditolak";

interface FormActionsProps {
  onReset?: () => void;
  onSubmit?: () => void;
  disabledReset?: boolean;
}

interface CardHeaderProps {
  title: string;
}

interface Step1Props {
  activeStep: number;
}

interface DocumentInfo {
  title: string;
  status: DocumentStatus;
  notes?: string;
  link?: string;
}

// Constants
const DOCUMENTS = [
  "Dokumen Surat Keterangan Selesai Kerja Praktik Dari Instansi",
  "Menghadiri Seminar Kerja Praktik Mahasiswa Lain Minimal 5 Kali",
  "Laporan Tambahan Tugas Kerja Praktik",
];

// Pemetaan title ke jenis_dokumen API
const DOCUMENT_TYPE_MAP: Record<string, string> = {
  "Dokumen Surat Keterangan Selesai Kerja Praktik Dari Instansi":
    "SURAT_KETERANGAN_SELESAI_KP",
  "Menghadiri Seminar Kerja Praktik Mahasiswa Lain Minimal 5 Kali":
    "FORM_KEHADIRAN_SEMINAR",
  "Laporan Tambahan Tugas Kerja Praktik": "LAPORAN_TAMBAHAN_KP",
};

// Pemetaan title dokumen ke URL
const DOCUMENT_URLS: Record<string, string> = {
  "Dokumen Surat Keterangan Selesai Kerja Praktik Dari Instansi":
    "/seminar-kp/dokumen/surat-keterangan-selesai-kp",
  "Menghadiri Seminar Kerja Praktik Mahasiswa Lain Minimal 5 Kali":
    "/seminar-kp/dokumen/form-kehadiran-seminar",
  "Laporan Tambahan Tugas Kerja Praktik":
    "/seminar-kp/dokumen/laporan-tambahan-kp",
};

// Regex untuk validasi Google Drive Link
const gdriveLinkRegex =
  /^https:\/\/drive\.google\.com\/(file\/d\/|drive\/folders\/|open\?id=)([a-zA-Z0-9_-]+)(\/?|\?usp=sharing|\&authuser=0)/;

// Component for gradient card header
const CardHeaderGradient: FC<CardHeaderProps> = ({ title }) => (
  <div className="bg-gradient-to-r from-emerald-600 to-green-500 px-6 py-4">
    <CardTitle className="text-white text-lg font-medium">{title}</CardTitle>
  </div>
);

// Form actions component for reuse
const FormActions: FC<FormActionsProps> = ({
  onReset,
  onSubmit,
  disabledReset,
}) => (
  <div className="flex justify-end mt-5">
    <div className="flex gap-3">
      <Button
        variant="outline"
        className="border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2"
        onClick={onReset}
        disabled={disabledReset}
      >
        <RefreshCw className="h-4 w-4" />
        Kosongkan Formulir
      </Button>
      <Button
        className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 text-white border-none shadow-sm hover:shadow"
        onClick={onSubmit}
      >
        Kirim
      </Button>
    </div>
  </div>
);

// Document list component
interface DocumentFormProps {
  documents: DocumentInfo[];
  showHeader?: boolean;
  showActions?: boolean;
  onReset?: () => void;
  onSubmit?: () => void;
  onLinkChange?: (index: number, value: string) => void;
}

const DocumentForm: FC<DocumentFormProps> = ({
  documents,
  showHeader = true,
  showActions = true,
  onReset,
  onSubmit,
  onLinkChange,
}) => (
  <>
    <Card className="border dark:border-none shadow-sm rounded-lg overflow-hidden dark:bg-gray-900">
      {showHeader && (
        <CardHeaderGradient title="Silakan isi formulir di bawah ini untuk divalidasi!" />
      )}
      <CardContent className="p-5 flex flex-col gap-5">
        {documents.map((doc, index) => (
          <DocumentCard
            key={doc.title}
            judulDokumen={doc.title}
            status={doc.status}
            catatan={doc.notes}
            link={doc.link}
            onLinkChange={(value) => onLinkChange && onLinkChange(index, value)}
          />
        ))}
      </CardContent>
    </Card>
    {showActions && (
      <FormActions
        onReset={onReset}
        onSubmit={onSubmit}
        disabledReset={documents.every(
          (doc) => doc.status !== "default" && doc.status !== "Ditolak"
        )}
      />
    )}
  </>
);

// Main component
const Step1: FC<Step1Props> = ({ activeStep }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formDocuments, setFormDocuments] = useState<DocumentInfo[]>([]);

  // Fetch data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["seminar-kp-dokumen"],
    queryFn: APISeminarKP.getDataMydokumen,
    staleTime: Infinity,
  });

  // Mutation untuk POST link dokumen
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: APISeminarKP.postLinkDokumen,
    onError: (error: any) => {
      toast({
        title: "❌ Gagal",
        description: `Gagal mengirim dokumen: ${error.message}`,
        duration: 3000,
      });
    },
  });

  // Inisialisasi formDocuments berdasarkan data API
  useEffect(() => {
    if (data?.data) {
      const step1Docs = data.data.dokumen_seminar_kp.step1 || [];
      const step1Accessible = data.data.steps_info.step1_accessible;

      const initialDocs = DOCUMENTS.map((title) => {
        const apiDoc =
          step1Docs.find(
            (doc: any) => DOCUMENT_TYPE_MAP[title] === doc.jenis_dokumen
          ) || {};
        return {
          title,
          status:
            (apiDoc.status as DocumentStatus) ||
            (step1Accessible ? "default" : "Terkirim"),
          notes: apiDoc.komentar || "",
          link: apiDoc.link_path || "",
        };
      });
      setFormDocuments(initialDocs);
    }
  }, [data]);

  // Hitung infoData hanya saat data berubah
  const infoData = useMemo(() => {
    return data?.data
      ? {
          judul: data.data.pendaftaran_kp[0]?.judul_kp || "Belum diisi",
          lokasi: data.data.pendaftaran_kp[0]?.instansi?.nama || "Belum diisi",
          dosenPembimbing:
            data.data.pendaftaran_kp[0]?.dosen_pembimbing?.nama ||
            "Belum diisi",
          kontakPembimbing:
            data.data.pendaftaran_kp[0]?.dosen_pembimbing?.no_hp ||
            "Belum diisi",
          lamaKerjaPraktek: `${
            data.data.pendaftaran_kp[0]?.tanggal_mulai
              ? new Date(
                  data.data.pendaftaran_kp[0].tanggal_mulai
                ).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : "Belum diisi"
          } - ${data.data.pendaftaran_kp[0]?.tanggal_selesai || "Belum diisi"}`,
        }
      : {};
  }, [data]);

  const informasiSeminarFields = [
    "judul",
    "lokasi",
    "dosenPembimbing",
    "kontakPembimbing",
    "lamaKerjaPraktek",
  ];

  // Handler for link changes
  const handleLinkChange = (index: number, value: string) => {
    const updatedDocs = [...formDocuments];
    updatedDocs[index] = { ...updatedDocs[index], link: value };
    setFormDocuments(updatedDocs);
  };

  const handleReset = () => {
    const resetDocs = formDocuments.map((doc) => {
      if (doc.status === "default" || doc.status === "Ditolak") {
        return { ...doc, link: "" };
      }
      return doc;
    });
    setFormDocuments(resetDocs);
    toast({
      title: "✅ Berhasil",
      description: "Formulir berhasil dikosongkan",
      duration: 3000,
    });
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleConfirm = async () => {
    setIsDialogOpen(false);
    const nim = data?.data.nim;
    const id_pendaftaran_kp = data?.data.pendaftaran_kp[0]?.id;

    // Kirim hanya dokumen dengan status "default" atau "Ditolak" yang memiliki link
    const documentsToSubmit = formDocuments.filter(
      (doc) =>
        doc.link && (doc.status === "default" || doc.status === "Ditolak")
    );

    if (documentsToSubmit.length === 0) {
      toast({
        title: "⚠️ Peringatan",
        description: "Harap isi setidaknya satu link dokumen",
        duration: 3000,
      });
      return;
    }

    // Validasi link: periksa apakah ada link yang bukan Google Drive
    const invalidDocs = documentsToSubmit.filter(
      (doc) => !gdriveLinkRegex.test(doc.link!)
    );

    if (invalidDocs.length > 0) {
      const invalidDocTitles = invalidDocs.map((doc) => doc.title).join(", ");
      toast({
        title: "❌ Gagal Mengirim",
        description: `Link dokumen berikut bukan Google Drive yang valid: ${invalidDocTitles}`,
        duration: 5000,
      });
      return;
    }

    // Array untuk melacak dokumen yang berhasil dikirim
    const successfullySubmittedDocs: string[] = [];

    // Kirim semua dokumen secara paralel dan lacak yang berhasil
    const submissionPromises = documentsToSubmit.map((doc) => {
      const url = DOCUMENT_URLS[doc.title];
      if (!url) {
        toast({
          title: "⚠️ Peringatan",
          description: `URL untuk dokumen "${doc.title}" tidak ditemukan!`,
          duration: 3000,
        });
        return Promise.resolve(null);
      }

      console.log(`Mengirim link untuk "${doc.title}": ${doc.link}`);
      return mutation
        .mutateAsync({
          nim,
          link_path: doc.link!,
          id_pendaftaran_kp,
          url,
        })
        .then(() => {
          successfullySubmittedDocs.push(doc.title);
        })
        .catch((error) => {
          console.error(`Gagal mengirim dokumen "${doc.title}":`, error);
          return null;
        });
    });

    // Tunggu semua pengiriman selesai
    await Promise.all(submissionPromises);

    // Tampilkan toast dengan daftar dokumen yang berhasil dikirim
    if (successfullySubmittedDocs.length > 0) {
      const docList = successfullySubmittedDocs.join(", ");
      toast({
        title: "✅ Berhasil",
        description: `Berhasil mengirim link dokumen: ${docList}`,
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["seminar-kp-dokumen"] });
    }
  };

  // Tentukan status berdasarkan data API dengan logika yang lebih akurat
  const status: StepStatus = useMemo(() => {
    if (!data?.data) return "belum";

    const step1Docs = data.data.dokumen_seminar_kp.step1 || [];
    const step1Accessible = data.data.steps_info.step1_accessible;

    // Jika step1_accessible true dan belum ada dokumen yang dikirim, status adalah "belum"
    if (step1Accessible && step1Docs.length === 0) {
      return "belum";
    }

    // Jika ada dokumen yang ditolak, status adalah "ditolak"
    if (step1Docs.some((doc: any) => doc.status === "Ditolak")) {
      return "ditolak";
    }

    // Jika semua dokumen sudah divalidasi, status adalah "diterima"
    if (
      step1Docs.length === DOCUMENTS.length &&
      step1Docs.every((doc: any) => doc.status === "Divalidasi")
    ) {
      return "diterima";
    }

    // Jika ada dokumen yang dikirim tetapi belum divalidasi, status adalah "validasi"
    if (step1Docs.length > 0) {
      return "validasi";
    }

    // Default status jika tidak ada kondisi di atas
    return "belum";
  }, [data]);

  // Render status notification
  const renderStatusNotification = () => {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    if (isError) {
      toast({
        title: "❌ Gagal",
        description: `Gagal mengambil data: ${error.message}`,
        duration: 3000,
      });
      return <div>Error: {error.message}</div>;
    }
    switch (status) {
      case "belum":
        return (
          <Status
            status="belum"
            title="Anda Belum Mengupload Dokumen Form Pendaftaran Diseminasi KP"
            subtitle="Silakan lengkapi dokumen terlebih dahulu."
          />
        );
      case "validasi":
        return (
          <Status
            status="validasi"
            title="Dokumen Anda Sedang dalam Proses Validasi"
          />
        );
      case "ditolak":
        return (
          <Status
            status="ditolak"
            title="Validasi Dokumen Anda Ditolak"
            subtitle="Silakan isi kembali Form sesuai perintah dengan benar!"
          />
        );
      case "diterima":
        return (
          <Status
            status="validasi"
            title="Dokumen Anda Telah Divalidasi"
            subtitle="Semua dokumen Anda telah diterima. Silakan lanjutkan ke langkah berikutnya."
          />
        );
      default:
        return null;
    }
  };

  // Tentukan apakah tombol action harus ditampilkan berdasarkan status dokumen
  const shouldShowActions = useMemo(() => {
    return formDocuments.some(
      (doc) => doc.status === "default" || doc.status === "Ditolak"
    );
  }, [formDocuments]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-8">
        Validasi Kelengkapan Berkas Seminar Kerja Praktik
      </h1>

      <Stepper activeStep={activeStep} />

      {renderStatusNotification()}

      {isLoading ? (
        <div>Loading InfoCard...</div>
      ) : (
        <InfoCard displayItems={informasiSeminarFields} data={infoData} />
      )}

      <div className={`${status === "ditolak" ? "flex flex-col gap-4" : ""}`}>
        <DocumentForm
          documents={formDocuments}
          showHeader={status !== "validasi" && status !== "diterima"}
          showActions={shouldShowActions}
          onReset={handleReset}
          onSubmit={handleOpenDialog}
          onLinkChange={handleLinkChange}
        />
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Pengiriman</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengirim dokumen ini untuk divalidasi?
              Dokumen yang telah dikirim tidak dapat diubah sampai proses
              validasi selesai.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 text-white"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Mengirim..." : "Yakin"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Step1;
