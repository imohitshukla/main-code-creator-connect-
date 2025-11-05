// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-subtle">
      <div className="text-center max-w-2xl mx-auto px-4">
        <div className="text-8xl mb-8">🔗</div>
        <h1 className="mb-6 text-display font-bold text-foreground">
          Welcome to Creator Connect
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          The ultimate platform connecting brands with talented creators. Start building authentic partnerships today!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="/filter" 
            className="inline-flex items-center justify-center px-8 py-3 bg-gradient-hero text-white rounded-lg hover:shadow-glow transition-all duration-300 font-medium"
          >
            Find Creators
          </a>
          <a 
            href="/campaign" 
            className="inline-flex items-center justify-center px-8 py-3 border border-primary text-primary rounded-lg hover:bg-primary-soft transition-all duration-300 font-medium"
          >
            Post Campaign
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;
