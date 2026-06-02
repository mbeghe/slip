import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  adminCreateProduct,
  adminUpdateProduct,
  adminUploadImage,
  fetchProducts,
} from "../../lib/api";
import { MAX_PRODUCT_IMAGES } from "../../components/ProductGallery";
import { parseGuaraniInput } from "../../lib/format";
import type { Product } from "../../types";

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [priceInput, setPriceInput] = useState("250000");
  const [colorsInput, setColorsInput] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [colorImages, setColorImages] = useState<Record<string, string[]>>({});
  const [featured, setFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);

  const colors = useMemo(() => splitList(colorsInput), [colorsInput]);
  const hasColors = colors.length > 0;

  useEffect(() => {
    if (!isEdit) return;
    fetchProducts()
      .then((list) => {
        const p = list.find((x) => x.id === Number(id));
        if (!p) {
          setError("Producto no encontrado");
          return;
        }
        fillForm(p);
      })
      .catch(() => setError("Error al cargar"))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function fillForm(p: Product) {
    setName(p.name);
    setSlug(p.slug);
    setDescription(p.description);
    setPriceInput(String(p.price));
    setColorsInput(p.colors.join(", "));
    setFeatured(p.featured);
    setSortOrder(p.sortOrder);

    const stored = p.colorImages ?? {};
    const hasStored = Object.keys(stored).some((k) => stored[k]?.length);

    if (p.colors.length > 0) {
      if (hasStored) {
        setColorImages(stored);
        setImageUrls(p.imageUrls);
      } else if (p.imageUrls.length > 0) {
        setColorImages({ [p.colors[0]]: [...p.imageUrls] });
        setImageUrls([p.imageUrls[0]]);
      } else {
        setColorImages(
          Object.fromEntries(p.colors.map((c) => [c, stored[c] ?? []]))
        );
        setImageUrls([]);
      }
    } else {
      setColorImages({});
      setImageUrls(p.imageUrls);
    }
  }

  function splitList(value: string): string[] {
    return value
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function buildPayload() {
    const colorList = splitList(colorsInput);
    let nextColorImages: Record<string, string[]> = {};
    let nextImageUrls = imageUrls;

    if (colorList.length > 0) {
      for (const c of colorList) {
        nextColorImages[c] = colorImages[c] ?? [];
      }
      const cover = colorList
        .map((c) => nextColorImages[c]?.[0])
        .find(Boolean);
      nextImageUrls = cover ? [cover] : [];
    } else {
      nextColorImages = {};
    }

    return {
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim(),
      price: parseGuaraniInput(priceInput),
      colors: colorList,
      imageUrls: nextImageUrls,
      colorImages: nextColorImages,
      featured,
      sortOrder,
    };
  }

  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    color?: string
  ) {
    const files = e.target.files;
    if (!files?.length) return;

    const current = color ? (colorImages[color] ?? []) : imageUrls;
    const remaining = MAX_PRODUCT_IMAGES - current.length;
    if (remaining <= 0) {
      setError(`Máximo ${MAX_PRODUCT_IMAGES} imágenes por ${color ? `color (${color})` : "producto"}`);
      e.target.value = "";
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    setError("");
    try {
      const added: string[] = [];
      for (const file of toUpload) {
        const { url } = await adminUploadImage(file);
        added.push(url);
      }
      if (color) {
        setColorImages((prev) => ({
          ...prev,
          [color]: [...(prev[color] ?? []), ...added],
        }));
      } else {
        setImageUrls((prev) => [...prev, ...added]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(url: string, color?: string) {
    if (color) {
      setColorImages((prev) => ({
        ...prev,
        [color]: (prev[color] ?? []).filter((u) => u !== url),
      }));
    } else {
      setImageUrls((prev) => prev.filter((u) => u !== url));
    }
  }

  function setCoverImage(url: string, color?: string) {
    if (color) {
      setColorImages((prev) => {
        const rest = (prev[color] ?? []).filter((u) => u !== url);
        return { ...prev, [color]: [url, ...rest] };
      });
    } else {
      setImageUrls((prev) => {
        const rest = prev.filter((u) => u !== url);
        return [url, ...rest];
      });
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = buildPayload();
    try {
      if (isEdit) {
        await adminUpdateProduct(Number(id), payload);
      } else {
        await adminCreateProduct(payload);
      }
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-slip-accent-blue">
        Cargando…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link to="/admin" className="text-sm text-slip-accent-blue hover:text-slip-primary">
        ← Volver
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slip-ink">
        {isEdit ? "Editar producto" : "Agregar producto"}
      </h1>
      <p className="mt-2 text-sm text-slip-accent-blue">
        Talles fijos en el sitio (ver guía de talles en la web).
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <Field label="Nombre *">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Slug (opcional)">
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto desde nombre"
            className={inputClass}
          />
        </Field>
        <Field label="Descripción">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={inputClass}
          />
        </Field>
        <Field label="Precio (Gs.) *">
          <input
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            placeholder="250000"
            required
            className={inputClass}
          />
        </Field>
        <Field label="Colores (separados por coma)">
          <input
            value={colorsInput}
            onChange={(e) => setColorsInput(e.target.value)}
            placeholder="Verde, Azul, Negro"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slip-accent-blue">
            Si cargás colores, subí fotos por cada color abajo. La portada del
            catálogo usa la primera foto del primer color.
          </p>
        </Field>
        <Field label="Orden en catálogo">
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className={inputClass}
          />
        </Field>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          <span className="font-semibold text-sm">Destacado</span>
        </label>

        {hasColors ? (
          <div className="space-y-6">
            {colors.map((color) => (
              <ImageUploadSection
                key={color}
                title={`Imágenes — ${color}`}
                urls={colorImages[color] ?? []}
                uploading={uploading}
                onUpload={(e) => handleImageUpload(e, color)}
                onRemove={(url) => removeImage(url, color)}
                onSetCover={(url) => setCoverImage(url, color)}
              />
            ))}
          </div>
        ) : (
          <ImageUploadSection
            title="Imágenes"
            hint={`La primera es la portada del catálogo. Máx. ${MAX_PRODUCT_IMAGES}.`}
            urls={imageUrls}
            uploading={uploading}
            onUpload={(e) => handleImageUpload(e)}
            onRemove={(url) => removeImage(url)}
            onSetCover={(url) => setCoverImage(url)}
          />
        )}

        {error && <p className="text-slip-primary text-sm font-medium">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-full bg-slip-primary text-white font-bold py-3 hover:bg-slip-primary-muted disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </form>
    </div>
  );
}

function ImageUploadSection({
  title,
  hint,
  urls,
  uploading,
  onUpload,
  onRemove,
  onSetCover,
}: {
  title: string;
  hint?: string;
  urls: string[];
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (url: string) => void;
  onSetCover: (url: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-slip-ink mb-1">{title}</p>
      {hint && (
        <p className="text-xs text-slip-accent-blue mb-3">{hint}</p>
      )}
      {urls.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-3">
          {urls.map((url, i) => (
            <div key={url} className="relative">
              <img
                src={url}
                alt=""
                className="h-24 w-24 rounded-lg object-cover border border-slip-accent-blue/30"
              />
              {i === 0 && (
                <span className="absolute top-1 left-1 rounded-full bg-slip-primary text-white text-[10px] font-bold px-2 py-0.5">
                  Principal
                </span>
              )}
              <button
                type="button"
                onClick={() => onRemove(url)}
                className="absolute -top-2 -right-2 bg-slip-ink text-white rounded-full w-5 h-5 text-xs leading-none"
                aria-label="Quitar imagen"
              >
                ×
              </button>
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => onSetCover(url)}
                  className="mt-1 w-full text-[10px] font-semibold text-slip-primary hover:underline"
                >
                  Usar como principal
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <label
        className={`inline-block rounded-full border-2 border-slip-primary text-slip-primary font-semibold px-4 py-2 text-sm hover:bg-slip-surface-warm ${
          urls.length >= MAX_PRODUCT_IMAGES || uploading
            ? "opacity-50 pointer-events-none"
            : "cursor-pointer"
        }`}
      >
        {uploading ? "Subiendo…" : "Agregar imágenes"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={onUpload}
          disabled={uploading || urls.length >= MAX_PRODUCT_IMAGES}
        />
      </label>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slip-accent-blue/40 px-4 py-2 bg-white";

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slip-ink mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
