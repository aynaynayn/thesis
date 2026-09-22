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
import type { Product } from "../data/products";
import { productsApi, type PetProfile } from "../lib/api";
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
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [selectedPreviewBreed, setSelectedPreviewBreed] = useState("");
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<PreviewTab>("images");

  useEffect(() => {
    setProduct(null);
    setError("");
    setActiveTab("images");
    void productsApi
      .get(productId)
      .then((loadedProduct) => {
        setProduct(loadedProduct);
        setSelectedPreviewBreed((current) =>
          loadedProduct.models.some((model) => model.breed === current)
            ? current
            : loadedProduct.models[0]?.breed || "",
        );
      })
      .catch((requestError: Error) => setError(requestError.message));
  }, [productId]);

  const selectedPet = user?.petProfiles.find((pet) => pet.id === selectedPetId);
  const sizes = useMemo(() => product ? [...new Set(product.inventory.map((item) => item.size))].map((size) => ({ size, stock: product.inventory.filter((item) => item.size === size).reduce((total, item) => total + item.stock, 0) })) : [], [product]);
  const recommendation = product && selectedPet ? recommendSize(selectedPet, product) : null;
  const recommendedAvailability = recommendation ? sizes.find((entry) => entry.size.trim().toUpperCase() === recommendation.size.trim().toUpperCase())?.stock || 0 : 0;
  useEffect(() => { if (recommendation?.size) setSelectedSize(recommendation.size); }, [recommendation?.size]);
  if (error) return <Empty message={error} back={() => navigate("shop")} />;
  if (!product)
    return (
      <main className="max-w-6xl mx-auto px-4 py-20 text-center text-muted-foreground">
        Loading product
      </main>
    );

  const selectedSizeAvailability = sizes.find((entry) => entry.size === selectedSize)?.stock || 0;
  const canAdd = selectedSizeAvailability > 0;
  const selectedModel = product.models.find(
    (model) => model.breed === selectedPreviewBreed,
  );
  const add = async () => {
    if (!selectedSize || !canAdd) return;
    if (!user) {
      navigate("auth");
      return;
    }
    try {
      await addItem(product, selectedSize, selectedPreviewBreed || undefined);
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
        className="border-b border-muted-foreground pb-0.5 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground mb-8"
      >
        Back to shop
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
            <PreviewPanel selectedModelPath={selectedModel?.modelPath} />
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
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex max-w-sm flex-col gap-1.5 text-sm font-bold text-foreground">
              Preview breed
              <select
                value={selectedPreviewBreed}
                onChange={(event) => setSelectedPreviewBreed(event.target.value)}
                disabled={!product.models.length}
                className="input"
              >
                {!product.models.length && <option>No 3D models uploaded</option>}
                {product.models.map((model) => (
                  <option key={model.breed} value={model.breed}>{model.breed}</option>
                ))}
              </select>
            </label>
            {user && (
              <label className="flex max-w-sm flex-col gap-1.5 text-sm font-bold text-foreground">
                Saved pet for size recommendation
                <select
                  value={selectedPetId}
                  onChange={(event) => setSelectedPetId(event.target.value)}
                  className="input"
                >
                  <option value="">Optional</option>
                  {user.petProfiles.map((pet) => (
                    <option key={pet.id} value={pet.id}>{pet.name} / {pet.breed}</option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-foreground mb-2">
              Select Size <span className="text-destructive">*</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((variant) => (
                <button
                  key={variant.size}
                  disabled={variant.stock === 0}
                  onClick={() => setSelectedSize(variant.size)}
                  className={`w-14 h-12 rounded-xl text-sm font-bold border disabled:opacity-40 ${selectedSize === variant.size ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card text-foreground"}`}
                >
                  {variant.size}
                </button>
              ))}
            </div>
            {recommendation ? <Recommendation recommendation={recommendation} petName={selectedPet?.name || "your pet"} available={recommendedAvailability > 0} /> : selectedPet ? <p className="mt-4 text-sm text-muted-foreground">No exact size match. Please review the size measurements.</p> : null}
          </div>
          <p className="text-xs text-muted-foreground">
            {selectedSize ? selectedSizeAvailability > 0 ? `${selectedSizeAvailability} in stock` : "Currently unavailable" : "Select a size to see availability."}
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            onClick={() => void add()}
            disabled={!canAdd}
            className={`border py-4 text-xs font-bold uppercase tracking-[0.12em] disabled:cursor-not-allowed ${added ? "border-primary bg-primary text-primary-foreground" : canAdd ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted text-muted-foreground"}`}
          >
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
  selectedModelPath,
  referenceNote,
}: {
  selectedModelPath?: string;
  referenceNote?: string;
}) {
  return (
    <div className="relative aspect-square rounded-3xl overflow-hidden border border-border bg-muted">
      <div className="h-full">
        {!selectedModelPath ? (
          <PreviewMessage message="3D reference model unavailable for this breed." />
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

              <hemisphereLight args={["#ffffff", "#7a6a60", 0.8]} />

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
      {referenceNote && <p className="absolute bottom-0 left-0 right-0 border-t border-border bg-card/95 p-3 text-xs leading-5 text-muted-foreground">{referenceNote}</p>}
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
      <div className="border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
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

function recommendSize(pet: PetProfile, product: Product) {
  const compatible = product.sizeSpecs.find((spec) =>
    pet.neckGirthCm >= spec.neckMinCm && pet.neckGirthCm <= spec.neckMaxCm &&
    pet.chestGirthCm >= spec.chestMinCm && pet.chestGirthCm <= spec.chestMaxCm &&
    pet.backLengthCm >= spec.backMinCm && pet.backLengthCm <= spec.backMaxCm,
  );
  if (!compatible) return null;
  return { size: compatible.size, detail: `Neck girth ${pet.neckGirthCm} cm, chest girth ${pet.chestGirthCm} cm, and back length ${pet.backLengthCm} cm are within this product's ${compatible.size} specifications.` };
}

function Recommendation({ recommendation, petName, available }: { recommendation: { size: string; detail: string }; petName: string; available: boolean }) {
  return <div className="mt-4 rounded-xl border border-primary/25 bg-secondary/55 p-4"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">Based on {petName}'s measurements</p><p className="mt-1 font-bold text-foreground">Recommended size: {recommendation.size}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{recommendation.detail}</p><p className={`mt-2 text-sm font-bold ${available ? "text-primary" : "text-destructive"}`}>{available ? "Currently available" : "Currently unavailable"}</p></div>;
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
