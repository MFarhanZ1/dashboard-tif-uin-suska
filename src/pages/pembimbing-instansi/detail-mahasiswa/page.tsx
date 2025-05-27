import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import toast, { Toaster } from "react-hot-toast";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useForm, Controller } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import APIKerjaPraktik from "@/services/api/pembimbing-instansi/daily-report.service";
import {
  ArrowLeft,
  User,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
  Star,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AssessmentFormData,
  EvaluationFormData,
  MahasiswaInstansiDetailResponse,
  Nilai,
  PutDailyReportData,
} from "@/interfaces/pages/mahasiswa/kerja-praktik/daily-report/daily-report.interface";

const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AssessmentFormData) => void;
  existingNilai?: Nilai[];
  formControl: ReturnType<typeof useForm<AssessmentFormData>>;
}

const AssessmentModal = ({
  isOpen,
  onClose,
  onSubmit,
  existingNilai,
  formControl,
}: AssessmentModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = formControl;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      modalRef.current?.focus();
      if (existingNilai && existingNilai[0]?.komponen_penilaian_instansi) {
        reset({
          deliverables:
            existingNilai[0].komponen_penilaian_instansi[0]?.deliverables ?? 0,
          ketepatan_waktu:
            existingNilai[0].komponen_penilaian_instansi[0]?.ketepatan_waktu ??
            0,
          kedisiplinan:
            existingNilai[0].komponen_penilaian_instansi[0]?.kedisiplinan ?? 0,
          attitude:
            existingNilai[0].komponen_penilaian_instansi[0]?.attitude ?? 0,
          kerjasama_tim:
            existingNilai[0].komponen_penilaian_instansi[0]?.kerjasama_tim ?? 0,
          inisiatif:
            existingNilai[0].komponen_penilaian_instansi[0]?.inisiatif ?? 0,
          masukan:
            existingNilai[0].komponen_penilaian_instansi[0]?.masukan ?? "",
        });
      } else {
        reset({
          deliverables: 0,
          ketepatan_waktu: 0,
          kedisiplinan: 0,
          attitude: 0,
          kerjasama_tim: 0,
          inisiatif: 0,
          masukan: "",
        });
      }
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, reset, existingNilai]);

  const values = watch();
  const nilaiInstansi = (
    (values.deliverables || 0) * 0.15 +
    (values.ketepatan_waktu || 0) * 0.1 +
    (values.kedisiplinan || 0) * 0.15 +
    (values.attitude || 0) * 0.15 +
    (values.kerjasama_tim || 0) * 0.25 +
    (values.inisiatif || 0) * 0.2
  ).toFixed(2);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => onClose()}
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-2xl py-6 px-8 w-[95%] md:max-w-[700px] max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <Button
          onClick={onClose}
          className="absolute p-2 bg-gray-100 rounded-full top-4 right-4 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
          variant="ghost"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </Button>
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-800 dark:text-white">
          {existingNilai ? "Edit Nilai Mahasiswa" : "Penilaian Mahasiswa"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {[
              { name: "deliverables", label: "Deliverables (15%)" },
              { name: "ketepatan_waktu", label: "Ketepatan Waktu (10%)" },
              { name: "kedisiplinan", label: "Kedisiplinan (15%)" },
              { name: "attitude", label: "Attitude (15%)" },
              { name: "kerjasama_tim", label: "Kerjasama Tim (25%)" },
              { name: "inisiatif", label: "Inisiatif (20%)" },
            ].map((field) => (
              <div key={field.name}>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {field.label}
                </label>
                <Controller
                  name={field.name as keyof AssessmentFormData}
                  control={control}
                  rules={{
                    required: `${field.label} wajib diisi`,
                    min: {
                      value: 0,
                      message: "Nilai tidak boleh kurang dari 0",
                    },
                    max: {
                      value: 100,
                      message: "Nilai tidak boleh lebih dari 100",
                    },
                  }}
                  render={({ field: { value, onChange } }) => (
                    <div className="mt-2">
                      <Slider
                        value={[
                          typeof value === "number" ? value : Number(value),
                        ]}
                        onValueChange={(vals) => onChange(vals[0])}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                        disabled={isSubmitting}
                      />
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Nilai: {value}
                      </p>
                    </div>
                  )}
                />
                {errors[field.name as keyof AssessmentFormData] && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors[field.name as keyof AssessmentFormData]?.message}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Masukan
            </label>
            <Textarea
              {...register("masukan", {
                required: "Masukan wajib diisi",
              })}
              className="mt-2"
              placeholder="Masukan untuk mahasiswa"
              disabled={isSubmitting}
            />
            {errors.masukan && (
              <p className="mt-1 text-sm text-red-500">
                {errors.masukan.message}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Nilai Akhir:
            </p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {nilaiInstansi}
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Menyimpan..."
                : existingNilai
                ? "Perbarui"
                : "Simpan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PembimbingInstansiKerjaPraktikMahasiswaDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isBulkEvalModalOpen, setIsBulkEvalModalOpen] =
    useState<boolean>(false);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] =
    useState<boolean>(false);
  const [isModalOpening, setIsModalOpening] = useState<boolean>(false);
  const itemsPerPage = 10;

  const {
    data: detailMahasiswaInstansiSaya,
    isLoading,
    error,
  } = useQuery<MahasiswaInstansiDetailResponse, Error>({
    queryKey: ["detail-mahasiswa-instansi-saya", id],
    queryFn: () =>
      APIKerjaPraktik.getDetailMahasiswaInstansiSaya(id!).then(
        (res) => res.data
      ),
    staleTime: Infinity,
    enabled: !!id,
  });

  const bulkEvalForm = useForm<EvaluationFormData>({
    defaultValues: {
      catatan_evaluasi: "",
      status: "Disetujui",
    },
  });

  const assessmentForm = useForm<AssessmentFormData>({
    defaultValues: {
      deliverables: 0,
      ketepatan_waktu: 0,
      kedisiplinan: 0,
      attitude: 0,
      kerjasama_tim: 0,
      inisiatif: 0,
      masukan: "",
    },
  });

  const putDailyReportMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PutDailyReportData }) =>
      APIKerjaPraktik.putDailyReport(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["detail-mahasiswa-instansi-saya", id],
      });
    },
    onError: (error: any) => {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Terjadi kesalahan saat menyimpan evaluasi"
      );
    },
  });

  const postNilaiMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssessmentFormData }) =>
      APIKerjaPraktik.postNilai(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["detail-mahasiswa-instansi-saya", id],
      });
      toast.success("Nilai berhasil disimpan");
      setIsAssessmentModalOpen(false);
      setIsModalOpening(false);
      assessmentForm.reset();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Terjadi kesalahan saat menyimpan nilai";
      toast.error(`Gagal menyimpan nilai: ${errorMessage}`);
      setIsModalOpening(false);
    },
  });

  const putNilaiMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssessmentFormData }) =>
      APIKerjaPraktik.putNilai(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["detail-mahasiswa-instansi-saya", id],
      });
      toast.success("Nilai berhasil diperbarui");
      setIsAssessmentModalOpen(false);
      setIsModalOpening(false);
      assessmentForm.reset();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Terjadi kesalahan saat memperbarui nilai";
      toast.error(`Gagal memperbarui nilai: ${errorMessage}`);
      setIsModalOpening(false);
    },
  });

  const handleBulkEvaluation = async (data: EvaluationFormData) => {
    if (selectedRows.length === 0) {
      toast.error("Pilih setidaknya satu laporan untuk evaluasi", {
        style: {
          background: "#EF4444",
          color: "#fff",
          padding: "16px",
          borderRadius: "8px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#EF4444",
        },
      });
      return;
    }
    try {
      const results = await Promise.allSettled(
        selectedRows.map((reportId) =>
          putDailyReportMutation.mutateAsync({
            id: reportId,
            data: {
              catatan_evaluasi: data.catatan_evaluasi,
              status: data.status,
            },
          })
        )
      );
      const failedCount = results.filter(
        (result) => result.status === "rejected"
      ).length;
      if (failedCount === 0) {
        toast.success(`Berhasil mengevaluasi ${selectedRows.length} laporan`, {
          style: {
            background: "#10B981",
            color: "#fff",
            padding: "16px",
            borderRadius: "8px",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#10B981",
          },
        });
      } else {
        toast.error(
          `Gagal mengevaluasi ${failedCount} dari ${selectedRows.length} laporan`,
          {
            style: {
              background: "#EF4444",
              color: "#fff",
              padding: "16px",
              borderRadius: "8px",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#EF4444",
            },
          }
        );
      }
      setIsBulkEvalModalOpen(false);
      bulkEvalForm.reset();
      setSelectedRows([]);
      setSelectAll(false);
    } catch (error) {
      toast.error("Gagal mengevaluasi laporan: Terjadi kesalahan tak terduga", {
        style: {
          background: "#EF4444",
          color: "#fff",
          padding: "16px",
          borderRadius: "8px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#EF4444",
        },
      });
    }
  };

  const handleAssessment = async (data: AssessmentFormData) => {
    if (!id) {
      toast.error("ID mahasiswa tidak ditemukan", {
        style: {
          background: "#EF4444",
          color: "#fff",
          padding: "16px",
          borderRadius: "8px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#EF4444",
        },
      });
      return;
    }
    try {
      if (detailMahasiswaInstansiSaya?.nilai?.length) {
        await putNilaiMutation.mutateAsync({ id, data });
      } else {
        await postNilaiMutation.mutateAsync({ id, data });
      }
    } catch (error) {
      // Errors are handled in the mutation
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusVariant = (status: string): string => {
    switch (status) {
      case "Disetujui":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "Revisi":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      case "Ditolak":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    }
  };

  const approvedReportsCount = (
    detailMahasiswaInstansiSaya?.daily_report || []
  ).filter((report) => report.status === "Disetujui").length;

  const canAssess = approvedReportsCount >= 22;

  const sortedDailyReports = (detailMahasiswaInstansiSaya?.daily_report || [])
    .slice()
    .sort(
      (a, b) =>
        new Date(a.tanggal_presensi).getTime() -
        new Date(b.tanggal_presensi).getTime()
    );

  const totalItems = sortedDailyReports.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReportData = sortedDailyReports.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedRows((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(currentReportData.map((row) => row.id));
    }
    setSelectAll(!selectAll);
  };

  const StudentProfileCard = ({
    student,
    loading,
  }: {
    student: MahasiswaInstansiDetailResponse | null;
    loading: boolean;
  }) => {
    return (
      <Card className="overflow-hidden border-none shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
        <div className="flex items-center justify-between p-6 text-white bg-gradient-to-br from-indigo-600 to-purple-700 rounded-t-xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center border rounded-full shadow-inner w-14 h-14 bg-white/10 border-white/20">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {loading ? "Loading..." : student?.mahasiswa.nama || "Unknown"}
              </h3>
              <p className="text-sm text-white/80">
                {loading ? "..." : student?.mahasiswa.nim || "Unknown"}
              </p>
            </div>
          </div>
          <Badge className="text-white bg-white/20 border-white/30">
            {loading ? "..." : student?.status || "Unknown"}
          </Badge>
        </div>
        <div className="grid grid-cols-1 gap-6 p-6 bg-gray-50 dark:bg-gray-800/50 sm:grid-cols-2">
          {loading ? (
            <>
              <div className="flex items-center gap-3">
                <Skeleton className="w-5 h-5" />
                <Skeleton className="w-32 h-4" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="w-5 h-5" />
                <Skeleton className="w-32 h-4" />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Tanggal Mulai
                  </p>
                  <p className="text-base text-gray-900 dark:text-white">
                    {student ? formatDate(student.tanggal_mulai) : "Unknown"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Tanggal Selesai
                  </p>
                  <p className="text-base text-gray-900 dark:text-white">
                    {student ? formatDate(student.tanggal_selesai) : "Unknown"}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    );
  };

  const EvaluationModal = ({
    isOpen,
    onClose,
    onSubmit,
    title,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: EvaluationFormData) => void;
    title: string;
  }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const {
      register,
      handleSubmit,
      control,
      formState: { errors, isSubmitting },
    } = bulkEvalForm;

    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = "hidden";
        modalRef.current?.focus();
      } else {
        document.body.style.overflow = "auto";
      }
      return () => {
        document.body.style.overflow = "auto";
      };
    }, [isOpen]);

    const backdropVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    };

    const modalVariants = {
      hidden: { scale: 0.95, y: 10, opacity: 0 },
      visible: {
        scale: 1,
        y: 0,
        opacity: 1,
        transition: { type: "spring", damping: 30, stiffness: 400 },
      },
    };

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="evaluation-modal"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
            onClick={() => onClose()}
          >
            <motion.div
              ref={modalRef}
              className="bg-white dark:bg-gray-900 rounded-2xl py-6 px-8 w-[95%] md:max-w-[600px] max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-200/50 dark:border-gray-700/50"
              variants={modalVariants}
              onClick={(e) => e.stopPropagation()}
              tabIndex={-1}
            >
              <Button
                onClick={onClose}
                className="absolute p-2 bg-gray-100 rounded-full top-4 right-4 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                variant="ghost"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </Button>
              <h2 className="mb-6 text-2xl font-bold text-center text-gray-800 dark:text-white">
                {title}
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Status Evaluasi
                  </label>
                  <Controller
                    name="status"
                    control={control}
                    rules={{ required: "Status wajib dipilih" }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Disetujui">Disetujui</SelectItem>
                          <SelectItem value="Revisi">Revisi</SelectItem>
                          <SelectItem value="Ditolak">Ditolak</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.status.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Catatan Evaluasi
                  </label>
                  <Textarea
                    {...register("catatan_evaluasi", {
                      required: "Catatan evaluasi wajib diisi",
                    })}
                    className="mt-2"
                    placeholder="Masukkan catatan evaluasi"
                    disabled={isSubmitting}
                  />
                  {errors.catatan_evaluasi && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.catatan_evaluasi.message}
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const existingNilai = useMemo(() => {
    if (
      detailMahasiswaInstansiSaya?.nilai?.length &&
      detailMahasiswaInstansiSaya.nilai.length > 0
    ) {
      return [detailMahasiswaInstansiSaya.nilai[0]];
    }
    return undefined;
  }, [JSON.stringify(detailMahasiswaInstansiSaya?.nilai)]);

  const handleOpenAssessmentModal = useCallback(
    debounce(() => {
      if (!isAssessmentModalOpen && !isModalOpening) {
        setIsModalOpening(true);
        setIsAssessmentModalOpen(true);
      }
    }, 300),
    [isAssessmentModalOpen, isModalOpening]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-10 h-10 border-t-2 border-indigo-500 rounded-full"
        ></motion.div>
      </div>
    );
  }

  if (error || !detailMahasiswaInstansiSaya) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <AlertTriangle className="w-12 h-12 mb-4 text-red-500" />
        <p className="mb-4 text-lg font-medium text-gray-700 dark:text-gray-300">
          Gagal memuat data: {error?.message || "Data tidak ditemukan"}
        </p>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => window.location.reload()}
        >
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mr-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold text-gray-800 md:text-2xl dark:text-white">
            Daily Report Kerja Praktik Mahasiswa
          </h1>
        </div>
        <StudentProfileCard
          student={detailMahasiswaInstansiSaya}
          loading={isLoading}
        />
        <Card className="mt-6 border-none shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
          <div className="flex flex-col items-start justify-end gap-4 p-6 border-b border-gray-200 sm:flex-row sm:items-center dark:border-gray-700">
            <div className="flex items-center w-full gap-3 sm:w-auto">
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => setIsBulkEvalModalOpen(true)}
                disabled={
                  selectedRows.length === 0 || putDailyReportMutation.isPending
                }
              >
                Evaluasi ({selectedRows.length})
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400"
                        onClick={handleOpenAssessmentModal}
                        // disabled={!canAssess || postNilaiMutation.isPending || putNilaiMutation.isPending || isModalOpening}
                      >
                        <Star className="w-4 h-4 mr-1" />
                        {(detailMahasiswaInstansiSaya.nilai?.length ?? 0) > 0
                          ? "Edit Nilai"
                          : "Berikan Nilai"}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!canAssess && (
                    <TooltipContent>
                      <p>
                        Min. ({approvedReportsCount}/22) daily report harus
                        disetujui untuk memberikan nilai...
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="p-6">
            {currentReportData.length > 0 ? (
              <>
                <Table>
                  <TableHeader className="bg-indigo-50 dark:bg-indigo-900/20">
                    <TableRow>
                      <TableHead className="font-semibold text-center text-gray-700 dark:text-gray-200">
                        Hari Ke-
                      </TableHead>
                      <TableHead className="font-semibold text-center text-gray-700 dark:text-gray-200">
                        Tanggal
                      </TableHead>
                      <TableHead className="font-semibold text-center text-gray-700 dark:text-gray-200">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-center text-gray-700 dark:text-gray-200">
                        Aksi
                      </TableHead>
                      <TableHead className="font-semibold text-center text-gray-700 dark:text-gray-200">
                        <Checkbox
                          checked={selectAll}
                          onCheckedChange={handleSelectAll}
                          className="border-gray-500 text-indigo-600 data-[state=checked]:bg-indigo-600"
                        />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentReportData.map((row, index) => (
                      <TableRow
                        key={row.id}
                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/20"
                      >
                        <TableCell className="py-4 font-medium text-center text-gray-900 dark:text-white">
                          {index + 1 + (currentPage - 1) * itemsPerPage}
                        </TableCell>
                        <TableCell className="py-4 text-center text-gray-700 dark:text-gray-300">
                          {formatDate(row.tanggal_presensi)}
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <Badge className={getStatusVariant(row.status)}>
                            {row.status || ""}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-indigo-600 border-indigo-300 hover:bg-indigo-50"
                              onClick={() =>
                                navigate(
                                  `/pembimbing-instansi/kerja-praktik/detail-mahasiswa/daily-report/${row.id}`
                                )
                              }
                            >
                              <FileText size={16} className="mr-1" />
                              Detail
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <Checkbox
                            checked={selectedRows.includes(row.id)}
                            onCheckedChange={() => handleCheckboxChange(row.id)}
                            className="border-gray-500 text-indigo-600 data-[state=checked]:bg-indigo-600"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex flex-col items-center justify-between gap-4 mt-6 sm:flex-row">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold">
                      {indexOfFirstItem + 1} -{" "}
                      {Math.min(indexOfLastItem, totalItems)}{" "}
                    </span>
                    dari <span className="font-semibold">{totalItems}</span>{" "}
                    Daily Report
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft size={16} className="mr-1" />
                      Previous
                    </Button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (pageNum) => (
                          <Button
                            key={pageNum}
                            variant={
                              pageNum === currentPage ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                            className={
                              pageNum === currentPage
                                ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                                : "border-gray-300 text-gray-700 hover:bg-gray-50"
                            }
                          >
                            {pageNum}
                          </Button>
                        )
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight size={16} className="ml-1" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center">
                <FileText
                  size={40}
                  className="mx-auto mb-4 text-gray-300 dark:text-gray-600"
                />
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  Tidak ada Daily Report...
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Belum ada Daily Report untuk mahasiswa ini...
                </p>
              </div>
            )}
          </div>
        </Card>
        <EvaluationModal
          isOpen={isBulkEvalModalOpen}
          onClose={() => {
            setIsBulkEvalModalOpen(false);
            bulkEvalForm.reset();
          }}
          onSubmit={handleBulkEvaluation}
          title={`Evaluasi ${selectedRows.length} Daily Report`}
        />
        <AssessmentModal
          isOpen={isAssessmentModalOpen}
          onClose={() => {
            setIsAssessmentModalOpen(false);
            setIsModalOpening(false);
            assessmentForm.reset();
          }}
          onSubmit={handleAssessment}
          existingNilai={existingNilai}
          formControl={assessmentForm}
        />
      </div>
    </>
  );
};

export default PembimbingInstansiKerjaPraktikMahasiswaDetailPage;
