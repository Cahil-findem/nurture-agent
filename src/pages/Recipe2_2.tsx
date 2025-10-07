import { useState, useEffect } from 'react';
import EmailPreview from '../components/EmailPreview';
import './Recipe2_2.css';

interface ColorSwatch {
  color: string;
  hex: string;
}

interface BrandAsset {
  id: string;
  url: string;
  name?: string;
}

interface Recipe2_2Props {
  onNavigate?: (page: 'demo-setup' | 'recipe1' | 'recipe-loader' | 'recipe2' | 'recipe2_2') => void;
}

const Recipe2_2: React.FC<Recipe2_2Props> = ({ onNavigate }) => {
  // const [logoFile, setLogoFile] = useState<File | null>(null);
  // const [logoUrl, setLogoUrl] = useState<string>('/Logo.png');
  const [colors, setColors] = useState<ColorSwatch[]>([
    { color: '#4552F6', hex: '#4599FA' },
    { color: '#A9D1FF', hex: '#A9D1FF' },
    { color: '#6ED69B', hex: '#6ED69B' },
    { color: '#8BEFB6', hex: '#8BEFB6' }
  ]);
  const [brandAssets] = useState<BrandAsset[]>([
    { id: 'asset-1', url: '/Brand%20Asset%2001.png', name: 'Woman in red beanie' },
    { id: 'asset-2', url: '/Brand%20Asset%2002.png', name: 'Mountain landscape' },
    { id: 'asset-3', url: '/Brand%20Asset%2003.png', name: 'Coastal cliffs' },
    { id: 'asset-4', url: '/Brand%20Asset%2004.png', name: 'Red surface texture' }
  ]);
  const [companyDescription, setCompanyDescription] = useState(
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer malesuada, lacus vel tristique fermentum, orci augue elementum nisi, ac porttitor mauris est non risus. Aenean sit amet sapien vitae lectus cursus iaculis at ac neque. Sed non leo euismod, sagittis libero eget, sollicitudin nulla.'
  );
  const [toneOfVoice, setToneOfVoice] = useState(
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer malesuada, lacus vel tristique fermentum, orci augue elementum nisi, ac porttitor mauris est non risus. Aenean sit amet sapien vitae lectus cursus iaculis at ac neque. Sed non leo euismod, sagittis libero eget, sollicitudin nulla.'
  );
  // const [previewMode, setPreviewMode] = useState<'preview' | 'edit'>('preview');
  const [liveContentSources, setLiveContentSources] = useState(4);
  const [showBlogPostsPopover, setShowBlogPostsPopover] = useState(false);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);

  // Load crawled data on component mount
  useEffect(() => {
    const demoData = localStorage.getItem('demoSetupData');
    if (demoData) {
      try {
        const parsedData = JSON.parse(demoData);
        console.log('Recipe2_2 - Loaded demo data:', parsedData);

        if (parsedData.crawledData) {
          const { crawledData } = parsedData;
          console.log('Recipe2_2 - Crawled data:', crawledData);

          // Update logo if available
          // if (crawledData.logo_url) {
          //   console.log('Recipe2_2 - Setting logo URL:', crawledData.logo_url);
          //   setLogoUrl(crawledData.logo_url);
          // } else {
          //   console.log('Recipe2_2 - No logo URL found in crawled data');
          // }

          // Update color palette if brand colors are available
          if (crawledData.brand_colors && crawledData.brand_colors.length > 0) {
            console.log('Recipe2_2 - Setting brand colors:', crawledData.brand_colors);
            // Ensure colors are in the correct format
            const formattedColors = crawledData.brand_colors.map((color: any) => ({
              color: color.hex || color.color,
              hex: color.hex || color.color
            }));
            setColors(formattedColors);
          }

          // Update company description if available
          if (crawledData.company_summary) {
            console.log('Recipe2_2 - Setting company summary:', crawledData.company_summary);
            setCompanyDescription(crawledData.company_summary);
          } else if (crawledData.about_text) {
            console.log('Recipe2_2 - Setting about text:', crawledData.about_text);
            setCompanyDescription(crawledData.about_text);
          }

          // Update tone of voice if available
          if (crawledData.tone_of_voice_example) {
            console.log('Recipe2_2 - Setting tone of voice:', crawledData.tone_of_voice_example);
            setToneOfVoice(crawledData.tone_of_voice_example);
          }

          // Update content sources based on blog posts
          if (crawledData.blog_posts && crawledData.blog_posts.length > 0) {
            setLiveContentSources(crawledData.blog_posts.length);
            setBlogPosts(crawledData.blog_posts.slice(0, 4)); // Store first 4 blog posts
            console.log('Recipe2_2 - Setting blog posts for popover:', crawledData.blog_posts.slice(0, 4));
          } else {
            console.log('Recipe2_2 - No blog posts found for popover');
          }
        } else {
          console.log('Recipe2_2 - No crawled data found');
        }
      } catch (error) {
        console.error('Error parsing demo data:', error);
      }
    } else {
      console.log('Recipe2_2 - No demo data found in localStorage');
    }
  }, []);


  // const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (file) {
  //     setLogoFile(file);
  //   }
  // };

  // const handleContinue = () => {
  //   const recipeData = {
  //     logo: logoFile,
  //     colors,
  //     brandAssets,
  //     companyDescription,
  //     toneOfVoice,
  //     timestamp: Date.now()
  //   };

  //   console.log('Recipe 2.2 data:', recipeData);
  //   alert('Content generation completed! (This will be replaced with navigation)');
  // };

  const handleRestartDemo = () => {
    // Navigate back to DemoSetup page
    onNavigate?.('demo-setup');
  };

  return (
    <div className="recipe2">
      <div className="recipe2-container">
        {/* Header */}
        <div className="recipe2-header">
          <h1 className="recipe2-title">All set — I've tailored your nurture flow to each candidate.</h1>
          <p className="recipe2-subtitle">
            Each candidate will experience your voice and fresh content, tailored just for them.
          </p>
        </div>

        {/* Content */}
        <div className="recipe2-content">
          {/* Email Preview Only */}
          <div className="recipe2-preview recipe2-preview-full">
            <EmailPreview />

            {/* Bottom Controls */}
            <div className="bottom-controls">
              {/* Live Content Sources Chip - Bottom Left */}
              <div
                className="content-sources-chip"
                onMouseEnter={() => {
                  console.log('Mouse enter - showing popover, blogPosts length:', blogPosts.length);
                  setShowBlogPostsPopover(true);
                }}
                onMouseLeave={() => {
                  console.log('Mouse leave - hiding popover');
                  setShowBlogPostsPopover(false);
                }}
              >
                <div className="active-badge"></div>
                <span className="content-sources-text">
                  {liveContentSources} live content sources integrated
                </span>

                {/* Blog Posts Popover */}
                {showBlogPostsPopover && blogPosts.length > 0 && (
                  <div className="blog-posts-popover">
                    <div className="popover-header">Recent Blog Posts</div>
                    <div className="popover-content">
                      {blogPosts.map((post, index) => (
                        <div key={index} className="blog-post-item">
                          <div className="blog-post-title">{post.title}</div>
                          <div className="blog-post-date">{post.publish_date}</div>
                          {post.summary && (
                            <div className="blog-post-summary">
                              {post.summary.slice(0, 100)}...
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Debug info */}
                {showBlogPostsPopover && blogPosts.length === 0 && (
                  <div className="blog-posts-popover">
                    <div className="popover-header">Debug Info</div>
                    <div className="popover-content">
                      <div className="blog-post-item">No blog posts available</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons - Bottom Right */}
              <div className="action-buttons">
                <button className="edit-button">
                  <span className="material-icons-round">edit</span>
                  Edit Campaign
                </button>
                <button className="send-sample-button">
                  <span className="material-icons-round">send</span>
                  Send Sample
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restart Demo Button */}
      <button
        className="restart-demo-button"
        onClick={handleRestartDemo}
        title="Restart Demo"
      >
        <span className="material-icons-round">refresh</span>
        <span className="restart-text">Restart</span>
      </button>
    </div>
  );
};

export default Recipe2_2;