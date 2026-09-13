import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Html, OrbitControls, useGLTF } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Box3, type Object3D, Vector3 } from "three";
import { ArrowLeft, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";
import type { Breed, Product, SizeChart } from "../data/products";
import { productsApi } from "../lib/api";
import { useCart } from "../context/CartContext";
import { useRouter } from "../context/RouterContext";
import { useAuth } from "../context/AuthContext";

type PreviewTab = "images" | "preview";

export default function ProductPage({ productId }: { productId: string }) {
  const { navigate } = useRouter();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [selectedBreed, setSelectedBreed] = useState<Breed | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [added, setAdded] = useState(false);
  useEffect(() => {
    setProduct(null);
    setError("");
    void productsApi
      .get(productId)
      .then((loadedProduct) => {
        setProduct(loadedProduct);
        const savedBreed = user?.petProfile?.breed;
        setSelectedBreed(
          savedBreed &&
            loadedProduct.availableBreeds.includes(savedBreed as Breed)
            ? (savedBreed as Breed)
            : null,
        );
      })
      .catch((requestError: Error) => setError(requestError.message));
  }, [productId, user]);
  const [activeTab, setActiveTab] = useState<PreviewTab>("images");
  const [previewBreed, setPreviewBreed] = useState("");

  useEffect(() => {
    setProduct(null);
    setError("");
    setActiveTab("images");
    setPreviewBreed("");
    void productsApi
      .get(productId)
      .then((loadedProduct) => {
        setProduct(loadedProduct);
        setPreviewBreed(loadedProduct.models[0]?.breed || "");
      })
      .catch((requestError: Error) => setError(requestError.message));
  }, [productId]);

  const sizes = useMemo(
    () =>
      product && selectedBreed
        ? product.inventory.filter((item) => item.breed === selectedBreed)
        : [],
    [product, selectedBreed],
  );
  const sizeChart: SizeChart | undefined =
    product && selectedBreed
      ? product.sizeCharts.find((chart) => chart.breed === selectedBreed)
      : undefined;
  if (error) return <Empty message={error} back={() => navigate("shop")} />;
  if (!product)
    return (
      <main className="max-w-6xl mx-auto px-4 py-20 text-center text-muted-foreground">
        Loading product
      </main>
    );

  const selectedVariant = product.inventory.find(
    (item) => item.breed === selectedBreed && item.size === selectedSize,
  );
  const canAdd = Boolean(selectedVariant && selectedVariant.stock > 0);
  const selectedModel = product.models.find(
    (model) => model.breed === previewBreed,
  );
  const add = async () => {
    if (!selectedBreed || !selectedSize || !canAdd) return;
    if (!user) {
      navigate("auth");
      return;
    }
    try {
      await addItem(product, selectedSize, selectedBreed);
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1800);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to add item to cart",
      );
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <button
        onClick={() => navigate("shop")}
        className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-8"
      >
        <ArrowLeft size={16} /> Back to Shop
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        <div>
          <div className="mb-3 inline-flex rounded-xl border border-border bg-card p-1">
            <button
              onClick={() => setActiveTab("images")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${activeTab === "images" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              Images
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${activeTab === "preview" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              3D Preview
            </button>
          </div>
          {activeTab === "images" ? (
            <div className="aspect-square rounded-3xl overflow-hidden bg-muted">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <PreviewPanel
              models={product.models}
              previewBreed={previewBreed}
              onBreedChange={setPreviewBreed}
              selectedModelPath={selectedModel?.modelPath}
            />
          )}
        </div>
        <div className="flex flex-col gap-6">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {product.category}
            </span>
            <h1 className="text-3xl font-extrabold text-foreground mt-1">
              {product.name}
            </h1>
            <p className="text-2xl font-bold text-primary mt-2">
              ₱{product.price.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              {product.description}
            </p>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground mb-2">
              Select Breed <span className="text-destructive">*</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {product.availableBreeds.map((breed) => (
                <button
                  key={breed}
                  onClick={() => {
                    setSelectedBreed(breed);
                    setSelectedSize(null);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border ${selectedBreed === breed ? "bg-accent text-accent-foreground border-accent" : "border-border bg-card text-foreground"}`}
                >
                  {breed}
                </button>
              ))}
            </div>
          </div>
          {selectedBreed && (
            <div>
              <p className="text-sm font-bold text-foreground mb-2">
                Select Size <span className="text-destructive">*</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((variant) => (
                  <button
                    key={variant._id || variant.size}
                    disabled={variant.stock === 0}
                    onClick={() => setSelectedSize(variant.size)}
                    className={`w-14 h-12 rounded-xl text-sm font-bold border disabled:opacity-40 ${selectedSize === variant.size ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card text-foreground"}`}
                  >
                    {variant.size}
                  </button>
                ))}
              </div>
              {sizeChart && (
                <>
                  <button
                    onClick={() => setSizeChartOpen((open) => !open)}
                    className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"
                  >
                    Size chart{" "}
                    {sizeChartOpen ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </button>
                  {sizeChartOpen && <SizeChartTable chart={sizeChart} />}
                </>
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {selectedVariant
              ? selectedVariant.stock > 0
                ? `${selectedVariant.stock} in stock`
                : "This size is out of stock"
              : "Select a breed and size to see availability."}
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            onClick={() => void add()}
            disabled={!canAdd}
            className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold disabled:cursor-not-allowed ${added ? "bg-green-600 text-white" : canAdd ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            <ShoppingBag size={20} />
            {added
              ? "Added to Cart"
              : canAdd
                ? user
                  ? "Add to Cart"
                  : "Sign in to Add to Cart"
                : "Select an available size"}
          </button>
        </div>
      </div>
    </main>
  );
}

function PreviewPanel({
  models,
  previewBreed,
  onBreedChange,
  selectedModelPath,
}: {
  models: Product["models"];
  previewBreed: string;
  onBreedChange: (breed: string) => void;
  selectedModelPath?: string;
}) {
  return (
    <div className="aspect-square rounded-3xl overflow-hidden border border-border bg-muted">
      <div className="p-3 border-b border-border bg-card">
        <label className="flex items-center gap-3 text-sm font-semibold text-foreground">
          Breed
          <select
            value={previewBreed}
            onChange={(event) => onBreedChange(event.target.value)}
            disabled={!models.length}
            className="input max-w-48"
          >
            {models.length ? (
              models.map((model) => (
                <option key={model.breed} value={model.breed}>
                  {model.breed}
                </option>
              ))
            ) : (
              <option>No models available</option>
            )}
          </select>
        </label>
      </div>

      <div className="h-[calc(100%-64px)]">
        {!models.length || !selectedModelPath ? (
          <PreviewMessage message="No 3D preview available." />
        ) : (
          <ModelErrorBoundary key={selectedModelPath}>
            <Canvas
              shadows
              camera={{ position: [0, 1.5, 4], fov: 45 }}
              gl={{ alpha: true, antialias: true }}
              style={{ background: "transparent" }}
              onCreated={({ gl }) => {
                gl.toneMappingExposure = 1.1;
              }}
            >
              <ambientLight intensity={0.45} />

              <emisphereLight args={["#ffffff", "#7a6a60", 0.8]} />

              <directionalLight
                position={[4, 6, 5]}
                intensity={2.4}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
              />

              <directionalLight position={[-4, 3, 3]} intensity={0.9} />

              <directionalLight position={[0, 4, -5]} intensity={1.2} />

              <Environment preset="studio" environmentIntensity={0.7} />

              <Suspense fallback={<LoadingPreview />}>
                <FittedModel
                  key={selectedModelPath}
                  url={modelAssetUrl(selectedModelPath)}
                />
              </Suspense>
            </Canvas>
          </ModelErrorBoundary>
        )}
      </div>
    </div>
  );
}

function FittedModel({ url }: { url: string }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const gltf = useGLTF(url);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  useEffect(() => {
    const box = new Box3().setFromObject(scene);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    const distance = Math.max(size.x, size.y, size.z, 1) * 1.8;
    scene.position.sub(center);
    camera.position.set(distance, distance * 0.55, distance);
    camera.near = 0.01;
    camera.far = distance * 20;
    camera.updateProjectionMatrix();
    controls.current?.target.set(0, 0, 0);
    controls.current?.update();
    return () => {
      disposeScene(scene);
      useGLTF.clear(url);
    };
  }, [camera, scene, url]);

  return (
    <>
      <primitive object={scene} />
      <OrbitControls ref={controls} enablePan={false} enableDamping />
    </>
  );
}

function LoadingPreview() {
  return (
    <Html center>
      <div className="rounded-full bg-card px-4 py-2 text-sm text-muted-foreground shadow">
        Loading 3D preview...
      </div>
    </Html>
  );
}
function PreviewMessage({ message }: { message: string }) {
  return (
    <div className="h-full flex items-center justify-center p-6 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

class ModelErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? (
      <PreviewMessage message="Unable to load 3D preview." />
    ) : (
      this.props.children
    );
  }
}

function disposeScene(scene: Object3D) {
  scene.traverse((object) => {
    const mesh = object as typeof object & {
      geometry?: { dispose: () => void };
      material?: { dispose: () => void } | { dispose: () => void }[];
    };
    mesh.geometry?.dispose();
    if (Array.isArray(mesh.material))
      mesh.material.forEach((material) => material.dispose());
    else mesh.material?.dispose();
  });
}
function modelAssetUrl(modelPath: string) {
  if (/^https?:\/\//i.test(modelPath)) return modelPath;
  const assetPath = modelPath.startsWith("/") ? modelPath : `/${modelPath}`;
  const apiOrigin = (import.meta.env.VITE_API_URL || "/api").replace(
    /\/api\/?$/,
    "",
  );
  return `${apiOrigin}${assetPath}`;
}
function SizeChartTable({ chart }: { chart: SizeChart }) {
  return (
    <div className="mt-3 rounded-2xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted">
            <th className="px-4 py-2 text-left text-xs">Size</th>
            <th className="px-4 py-2 text-left text-xs">Neck</th>
            <th className="px-4 py-2 text-left text-xs">Chest</th>
            <th className="px-4 py-2 text-left text-xs">Back</th>
          </tr>
        </thead>
        <tbody>
          {chart.sizes.map((size) => (
            <tr key={size.label}>
              <td className="px-4 py-2 font-semibold">{size.label}</td>
              <td className="px-4 py-2">{size.neckCm} cm</td>
              <td className="px-4 py-2">{size.chestCm} cm</td>
              <td className="px-4 py-2">{size.backCm} cm</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Empty({ message, back }: { message: string; back: () => void }) {
  return (
    <main className="max-w-6xl mx-auto px-4 py-20 text-center">
      <p className="text-muted-foreground">{message}</p>
      <button
        onClick={back}
        className="mt-4 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm"
      >
        Back to Shop
      </button>
    </main>
  );
}
