import Carousel from "@components/ui/carousel/carousel";
import React from "react";
import { SwiperSlide } from "swiper/react";

const CustomerReviews: React.FC = () => {
  const reviews = [
    {
      message: "I ordered a gorgeous flower arrangement from Because You for my mother's birthday that made her cry with happiness. Their timely delivery and attention to detail were far above my expectations. Highly recommend them to buy flower in Malaysia!",
      name: "Edison Lai"
    },
    {
      message: "I ordered last-minute flowers for my anniversary from Because You, and I am so glad I did. They delivered the beautiful bouquet that was exactly the same bouquet I had ordered on short notice. Their professionalism and dedication towards customer satisfaction are amazing!",
      name: "Jasmine Tang"
    },
    {
      message: "I am very grateful to Because You for sending my best wishes to a friend during a difficult time. They made a beautiful and soothing arrangement of sympathy that brought peace during a time filled with heartbreak. Thank you!",
      name: "Ceilein Tan"
    },
  ];

  const breakpoints = {
    "1720": {
      slidesPerView: 1,
    }
  };

  return (
    <>
      <div className="content blog-content customerReview">
        <h3>Heartwarming Feedbacks from Our Lovely Customers</h3>
        <div className="mb-10 md:mb-11 lg:mb-12 xl:mb-14 lg:pb-1 xl:pb-0">
          <Carousel
            breakpoints={breakpoints}
            buttonClassName="-mt-8 md:-mt-10"
          >
            {reviews.map((review, index) => (
              <SwiperSlide key={index}>
                <div className="text-center">
                  <p className="text-lg font-semibold mb-4">{review.message}</p>
                  <p className="text-gray-500">{review.name}</p>
                </div>
              </SwiperSlide>
            ))}
          </Carousel>
        </div>
      </div>
    </>
  );
};

export default CustomerReviews;