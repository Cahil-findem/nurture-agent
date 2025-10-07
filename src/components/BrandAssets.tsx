import './BrandAssets.css';

interface BrandAsset {
  id: string;
  url: string;
  name?: string;
}

interface BrandAssetsProps {
  assets: BrandAsset[];
  onAssetsChange?: (assets: BrandAsset[]) => void;
  maxAssets?: number;
}

const BrandAssets: React.FC<BrandAssetsProps> = ({
  assets,
  onAssetsChange,
  maxAssets = 8
}) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || assets.length >= maxAssets) return;

    const newAssets: BrandAsset[] = [];

    for (let i = 0; i < files.length && (assets.length + newAssets.length) < maxAssets; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);

      newAssets.push({
        id: `asset-${Date.now()}-${i}`,
        url,
        name: file.name
      });
    }

    if (newAssets.length > 0) {
      onAssetsChange?.([...assets, ...newAssets]);
    }
  };

  const handleRemoveAsset = (assetId: string) => {
    const updatedAssets = assets.filter(asset => {
      if (asset.id === assetId) {
        // Clean up object URL to prevent memory leaks
        URL.revokeObjectURL(asset.url);
        return false;
      }
      return true;
    });
    onAssetsChange?.(updatedAssets);
  };

  return (
    <div className="brand-assets">
      <div className="assets-grid">
        {assets.map((asset) => (
          <div key={asset.id} className="asset-item">
            <div className="asset-image-container">
              <img
                src={asset.url}
                alt={asset.name || 'Brand asset'}
                className="asset-image"
              />
              <button
                className="remove-asset-button"
                onClick={() => handleRemoveAsset(asset.id)}
                aria-label="Remove asset"
              >
                <span className="material-icons-round">close</span>
              </button>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default BrandAssets;