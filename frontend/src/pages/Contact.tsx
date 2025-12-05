import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Send, Instagram, Linkedin, Twitter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getApiUrl } from '@/lib/utils';

const Contact = () => {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: 'Message Sent!',
          description: 'Thank you for your message. We\'ll get back to you within 24 hours.',
        });

        // Reset form
        setFormData({
          name: '',
          email: '',
          message: ''
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'mohitshukla57662@gmail.com',
      link: 'mailto:mohitshukla57662@gmail.com'
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '7068896437',
      link: 'tel:7068896437'
    },
    {
      icon: MapPin,
      title: 'Location',
      value: 'Bengaluru, India',
      link: null
    }
  ];

  const socialLinks = [
    {
      icon: Instagram,
      name: 'Instagram',
      url: 'https://instagram.com/creatorconnect',
      color: 'hover:text-pink-500'
    },
    {
      icon: Linkedin,
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/company/creator-connect-m/',
      color: 'hover:text-blue-600'
    },
    {
      icon: Twitter,
      name: 'Twitter',
      url: 'https://twitter.com/creatorconnect',
      color: 'hover:text-blue-400'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-display font-bold text-foreground mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-muted-foreground">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <h3 className="text-xl font-semibold text-foreground">Contact Information</h3>
                <p className="text-muted-foreground text-sm">
                  Reach out to us through any of these channels
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary-soft rounded-lg flex items-center justify-center flex-shrink-0">
                      <info.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground text-sm">{info.title}</h4>
                      {info.link ? (
                        <a
                          href={info.link}
                          className="text-muted-foreground hover:text-primary transition-smooth text-sm"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-muted-foreground text-sm">{info.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <h3 className="text-xl font-semibold text-foreground">Follow Us</h3>
                <p className="text-muted-foreground text-sm">
                  Stay connected on social media
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 bg-primary-soft rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-soft ${social.color}`}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Business Hours */}
            <Card className="bg-gradient-hero text-white border-0">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3">Business Hours</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>10:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-card border-0 shadow-soft">
              <CardHeader>
                <h3 className="text-2xl font-semibold text-foreground">Send us a Message</h3>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        required
                        className="bg-background border-border focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email Address *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        required
                        className="bg-background border-border focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us about your project, questions, or how we can help you..."
                      required
                      rows={6}
                      className="bg-background border-border focus:border-primary resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-hero hover:shadow-glow transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;