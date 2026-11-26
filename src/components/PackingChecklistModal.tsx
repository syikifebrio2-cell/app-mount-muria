import { useState, useEffect } from "react";
import {
  CheckSquare,
  Square,
  Sparkles,
  RotateCcw,
  X,
  Plus,
  Trash2,
  Tent,
  Shirt,
  UtensilsCrossed,
  FileText,
  ShieldPlus,
} from "lucide-react";
import { toast } from "sonner";

export type ChecklistItem = {
  id: string;
  nama: string;
  kategori: "wajib" | "logistik" | "pakaian" | "dokumen";
  selesai: boolean;
};

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  // Wajib & Keamanan
  { id: "1", nama: "Tenda & Frame cadangan", kategori: "wajib", selesai: false },
  { id: "2", nama: "Matras & Sleeping Bag hangat", kategori: "wajib", selesai: false },
  { id: "3", nama: "Headlamp / Senter + baterai cadangan", kategori: "wajib", selesai: false },
  { id: "4", nama: "Kotak P3K pribadi & obat pribadi", kategori: "wajib", selesai: false },
  { id: "5", nama: "Peluit darurat & korek api tahan air", kategori: "wajib", selesai: false },
  { id: "6", nama: "Kantong sampah (Trash bag wajib bawa turun)", kategori: "wajib", selesai: false },

  // Logistik & Air
  { id: "7", nama: "Air mineral minimal 2-3 Liter/orang", kategori: "logistik", selesai: false },
  { id: "8", nama: "Nesting & Kompor portable", kategori: "logistik", selesai: false },
  { id: "9", nama: "Makanan tinggi kalori (madu, cokelat, biskuit)", kategori: "logistik", selesai: false },
  { id: "10", nama: "Bahan makanan pokok selama kamping", kategori: "logistik", selesai: false },

  // Pakaian
  { id: "11", nama: "Jas Hujan / Poncho gunung", kategori: "pakaian", selesai: false },
  { id: "12", nama: "Jaket gunung windproof/fleece", kategori: "pakaian", selesai: false },
  { id: "13", nama: "Sepatu / Sandal gunung dengan grip baik", kategori: "pakaian", selesai: false },
  { id: "14", nama: "Pakaian ganti kering (plastik kedap air)", kategori: "pakaian", selesai: false },

  // Dokumen
  { id: "15", nama: "E-Tiket Muria Trail (Simpan offline)", kategori: "dokumen", selesai: false },
  { id: "16", nama: "KTP Asli / Tanda Pengenal", kategori: "dokumen", selesai: false },
  { id: "17", nama: "Surat Keterangan Sehat Puskesmas", kategori: "dokumen", selesai: false },
  { id: "18", nama: "Uang tunai kecil (ojek, parkir & retribusi)", kategori: "dokumen", selesai: false },
];

const STORAGE_KEY = "muria:packing-checklist";

export function PackingChecklistModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [filter, setFilter] = useState<"semua" | "wajib" | "logistik" | "pakaian" | "dokumen">("semua");
  const [itemBaru, setItemBaru] = useState("");

  // Muat data dari localStorage
  useEffect(() => {
    if (!isOpen) return;
    try {
      const tersimpan = localStorage.getItem(STORAGE_KEY);
      if (tersimpan) {
        setItems(JSON.parse(tersimpan));
      } else {
        setItems(DEFAULT_CHECKLIST);
      }
    } catch {
      setItems(DEFAULT_CHECKLIST);
    }
  }, [isOpen]);

  function simpan(data: ChecklistItem[]) {
    setItems(data);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // kuota penuh
    }
  }

  function toggle(id: string) {
    const baru = items.map((i) => (i.id === id ? { ...i, selesai: !i.selesai } : i));
    simpan(baru);
  }

  function tambahItem() {
    if (!itemBaru.trim()) return;
    const item: ChecklistItem = {
      id: Date.now().toString(),
      nama: itemBaru.trim(),
      kategori: filter === "semua" ? "wajib" : filter,
      selesai: false,
    };
    simpan([...items, item]);
    setItemBaru("");
    toast.success("Barang ditambahkan ke checklist!");
  }

  function hapusItem(id: string) {
    simpan(items.filter((i) => i.id !== id));
  }

  function resetChecklist() {
    if (confirm("Reset semua checklist ke kondisi awal?")) {
      simpan(DEFAULT_CHECKLIST);
      toast.success("Checklist di-reset.");
    }
  }

  const selesaiCount = items.filter((i) => i.selesai).length;
  const persen = items.length ? Math.round((selesaiCount / items.length) * 100) : 0;

  const filtered = filter === "semua" ? items : items.filter((i) => i.kategori === filter);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="relative flex w-full max-w-md flex-col max-h-[90vh] overflow-hidden rounded-t-[2.5rem] sm:rounded-3xl border border-border bg-card text-foreground shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <div>
            <h2 className="text-base font-extrabold tracking-tight">Checklist Perlengkapan</h2>
            <p className="text-[11px] font-medium text-muted-foreground">
              Persiapan mendaki Gunung Muria
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={resetChecklist}
              title="Reset checklist"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-foreground hover:bg-secondary/80"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar Persiapan */}
        <div className="border-b border-border bg-muted/30 px-5 py-3">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="flex items-center gap-1.5 text-primary">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> Kesiapan Perlengkapan
            </span>
            <span className="font-mono text-xs">{selesaiCount} / {items.length} ({persen}%)</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                persen === 100 ? "bg-success" : "bg-primary"
              }`}
              style={{ width: `${persen}%` }}
            />
          </div>
        </div>

        {/* Filter Kategori */}
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto border-b border-border px-5 py-2.5 bg-card text-[11px]">
          <KategoriPill aktif={filter === "semua"} label="Semua" onClick={() => setFilter("semua")} />
          <KategoriPill aktif={filter === "wajib"} icon={Tent} label="Wajib & P3K" onClick={() => setFilter("wajib")} />
          <KategoriPill aktif={filter === "logistik"} icon={UtensilsCrossed} label="Logistik" onClick={() => setFilter("logistik")} />
          <KategoriPill aktif={filter === "pakaian"} icon={Shirt} label="Pakaian" onClick={() => setFilter("pakaian")} />
          <KategoriPill aktif={filter === "dokumen"} icon={FileText} label="Dokumen" onClick={() => setFilter("dokumen")} />
        </div>

        {/* Daftar Barang */}
        <div className="no-scrollbar flex-1 overflow-y-auto p-5 space-y-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => toggle(item.id)}
              className={`flex items-center justify-between gap-3 rounded-2xl border p-3 cursor-pointer select-none transition-all ${
                item.selesai
                  ? "border-success/30 bg-success/8 text-muted-foreground"
                  : "border-border bg-card text-foreground shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {item.selesai ? (
                  <CheckSquare className="h-5 w-5 shrink-0 text-success" />
                ) : (
                  <Square className="h-5 w-5 shrink-0 text-muted-foreground" />
                )}
                <span className={`text-xs font-semibold truncate ${item.selesai ? "line-through opacity-80" : ""}`}>
                  {item.nama}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  hapusItem(item.id);
                }}
                className="text-muted-foreground/50 hover:text-destructive p-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {/* Form Tambah Barang Kustom */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={itemBaru}
              onChange={(e) => setItemBaru(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && tambahItem()}
              placeholder="Tambah perlengkapan lain..."
              className="flex-1 rounded-xl border border-input bg-card px-3.5 py-2 text-xs shadow-sm outline-none placeholder:text-muted-foreground/60 focus:border-ring"
            />
            <button
              onClick={tambahItem}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm active:scale-95"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-card px-5 py-3">
          <button
            onClick={onClose}
            className="w-full rounded-2xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-card"
          >
            Selesai Memeriksa
          </button>
        </div>
      </div>
    </div>
  );
}

function KategoriPill({
  aktif,
  label,
  icon: Icon,
  onClick,
}: {
  aktif: boolean;
  label: string;
  icon?: any;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 font-bold transition-colors ${
        aktif
          ? "bg-primary text-primary-foreground shadow-sm"
          : "bg-secondary text-muted-foreground hover:text-foreground"
      }`}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </button>
  );
}
