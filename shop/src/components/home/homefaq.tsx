import React, { useState } from 'react';

const HomeFaqs: React.FC = () => {

    const [activeIndex, setActiveIndex] = useState<number | null>(0);

    const toggleAccordion = (index: number) => {
      setActiveIndex(activeIndex === index ? null : index);
    };
  
    const accordionItems = [
      {
        header: "1.	What distinguishes your floral shop from others?",
        content: "We offer unwavering commitment to quality, creativity, and customer service that makes us the best choice. Our team create beautiful floral arrangements with fresh flowers to meet every client requirement."
      },
      {
        header: "2. Can I order flowers online for delivery?",
        content: "Yes, you can conveniently order flowers online for timely delivery. Because You team provide seamless online ordering with a reliable florist same day delivery."
      },
      {
        header: "3. Do you offer flower delivery services in Kuala Lumpur the same day?",
        content: "Yes, we offer timely and quick flower delivery same day in KL. We help you to surprise your loved one with fresh and beautiful arrangements delivered to their doorstep."
      },
      {
        header: "4.	How can I buy flowers online from your shop in Malaysia?",
        content: "You have to perform simple steps to buy flower online from Because You shop: <br /> - Visit our website <br /> - Explore our selection<br /> - Select the flowers <br /> - Complete details for checkout"
      },
      {
        header: "5.	What types of floral arrangements are available?",
        content: "You will find a wide variety of floral arrangements, including bouquets, centrepieces, wreaths, corsages, and custom arrangements."
      }
    ];

  return (
    <>
        <div className = "blog-content home-content">
          <h3 className="faqs-section"><strong>FAQs</strong></h3>
          <div className="accordion faq-section" id="accordionExample">
              <div className="accordion-items">
                  {accordionItems.map((item, index) => (
                  <div className={`accordion-item ${activeIndex === index ? 'active' : ''}`} key={index}>
                      <div className="accordion-button accordion-header" onClick={() => toggleAccordion(index)}>
                      {item.header}
                      </div>
                      {activeIndex === index && (
                      <div className="accordion-collapse">
                          <div className="accordion-body" dangerouslySetInnerHTML={{ __html: item.content }}>
                          </div>
                      </div>
                      )}
                  </div>
                  ))}
              </div>
          </div>
        </div>
    </>
  );
};

export default HomeFaqs;