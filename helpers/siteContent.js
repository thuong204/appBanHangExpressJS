/**
 * Nội dung tĩnh cho các trang thông tin (tin tức, chính sách, FAQ, cửa hàng...).
 * Sửa trực tiếp file này để cập nhật nội dung hiển thị trên website.
 */

const COMPANY = {
  name: "Công ty TNHH Vô Thường",
  hotline: "1900 1234",
  hotlineTel: "19001234",
  email: "support@vothuong.com",
  address: "Phường Hòa Quý, Quận Ngũ Hành Sơn, TP. Đà Nẵng",
  hours: "8:00 - 22:00 (cả Thứ 7, Chủ nhật)",
};

const img = (path) => `https://cdn.dummyjson.com/product-images/${path}/thumbnail.webp`;

const NEWS_CATEGORIES = [
  { slug: "danh-gia", title: "Đánh giá" },
  { slug: "tu-van", title: "Tư vấn chọn mua" },
  { slug: "thu-thuat", title: "Thủ thuật" },
  { slug: "khuyen-mai", title: "Khuyến mãi" },
];

const NEWS = [
  {
    slug: "nen-mua-iphone-13-pro-hay-iphone-15",
    title: "Nên mua iPhone 13 Pro hay iPhone 15 ở thời điểm hiện tại?",
    category: "tu-van",
    date: "2026-10-22",
    image: img("smartphones/iphone-13-pro"),
    excerpt: "iPhone 13 Pro có màn hình 120Hz và camera tele, iPhone 15 có cổng USB-C và Dynamic Island. Đâu là lựa chọn đáng tiền hơn?",
    content: `
<p>Khi ngân sách khoảng 15 - 18 triệu đồng, nhiều khách hàng phân vân giữa <strong>iPhone 13 Pro</strong> và <strong>iPhone 15</strong>. Dưới đây là những điểm khác biệt chính giúp bạn quyết định nhanh hơn.</p>
<h2>Màn hình</h2>
<p>iPhone 13 Pro sở hữu màn hình ProMotion 120Hz cho trải nghiệm cuộn mượt mà, trong khi iPhone 15 vẫn dừng ở 60Hz nhưng có Dynamic Island tiện lợi.</p>
<h2>Camera</h2>
<p>13 Pro có thêm ống kính tele 3x, phù hợp người thích chụp chân dung. iPhone 15 có cảm biến chính 48MP cho ảnh chi tiết hơn trong điều kiện đủ sáng.</p>
<h2>Kết nối và pin</h2>
<p>iPhone 15 dùng cổng USB-C, dùng chung sạc với laptop và máy tính bảng. Thời lượng pin của hai máy tương đương nhau khi sử dụng hỗn hợp.</p>
<h2>Kết luận</h2>
<ul>
  <li>Chọn <strong>iPhone 13 Pro</strong> nếu bạn ưu tiên màn hình mượt và camera tele.</li>
  <li>Chọn <strong>iPhone 15</strong> nếu bạn muốn máy mới, cổng USB-C và thời gian cập nhật phần mềm dài hơn.</li>
</ul>`,
  },
  {
    slug: "danh-gia-macbook-pro-14-m3",
    title: "Đánh giá MacBook Pro 14 M3: hiệu năng mạnh, pin cả ngày",
    category: "danh-gia",
    date: "2026-10-15",
    image: img("laptops/apple-macbook-pro-14-inch-space-grey"),
    excerpt: "Sau 2 tuần sử dụng cho công việc lập trình và chỉnh sửa ảnh, MacBook Pro 14 M3 cho thấy đây là chiếc laptop toàn diện.",
    content: `
<p>MacBook Pro 14 inch chip M3 là bản nâng cấp đáng chú ý dành cho người dùng chuyên nghiệp cần một máy gọn nhẹ nhưng vẫn mạnh mẽ.</p>
<h2>Thiết kế</h2>
<p>Vỏ nhôm nguyên khối chắc chắn, đầy đủ cổng HDMI, khe thẻ SD và MagSafe 3 — không cần mang theo hub chuyển đổi.</p>
<h2>Hiệu năng</h2>
<p>Chip M3 xử lý mượt các tác vụ lập trình, biên dịch dự án vừa và chỉnh sửa ảnh RAW. Máy gần như không nóng khi làm việc văn phòng.</p>
<h2>Thời lượng pin</h2>
<p>Trong thử nghiệm thực tế với trình duyệt, IDE và nhạc nền, máy dùng được khoảng 14 - 16 giờ.</p>
<p><strong>Điểm cộng:</strong> màn hình Liquid Retina XDR đẹp, loa hay, pin trâu. <strong>Điểm trừ:</strong> bản 8GB RAM hơi hạn chế cho nhu cầu nặng.</p>`,
  },
  {
    slug: "cach-chon-dieu-hoa-theo-dien-tich-phong",
    title: "Cách chọn công suất điều hòa phù hợp diện tích phòng",
    category: "tu-van",
    date: "2026-10-08",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Panasonic_AIR_CONDITIONER_INDOOR_UNIT_CS-C10KJ2_%282%29.jpg/960px-Panasonic_AIR_CONDITIONER_INDOOR_UNIT_CS-C10KJ2_%282%29.jpg",
    excerpt: "Chọn sai công suất khiến điều hòa làm lạnh chậm hoặc tốn điện. Bảng tra nhanh dưới đây giúp bạn chọn đúng ngay từ đầu.",
    content: `
<p>Công suất điều hòa (BTU hoặc HP) cần phù hợp với diện tích và đặc điểm căn phòng để làm lạnh hiệu quả và tiết kiệm điện.</p>
<h2>Bảng tra nhanh</h2>
<ul>
  <li>Dưới 15m²: <strong>1 HP (9.000 BTU)</strong></li>
  <li>15 - 20m²: <strong>1.5 HP (12.000 BTU)</strong></li>
  <li>20 - 30m²: <strong>2 HP (18.000 BTU)</strong></li>
  <li>30 - 40m²: <strong>2.5 HP (24.000 BTU)</strong></li>
</ul>
<h2>Các yếu tố cần cộng thêm</h2>
<p>Nếu phòng có nhiều cửa kính, hướng Tây, trần cao hoặc đông người, nên chọn công suất lớn hơn một bậc.</p>
<h2>Nên chọn Inverter?</h2>
<p>Với nhu cầu sử dụng trên 6 giờ/ngày, điều hòa Inverter giúp tiết kiệm 30 - 50% điện năng so với loại thường.</p>`,
  },
  {
    slug: "5-meo-keo-dai-tuoi-tho-pin-dien-thoai",
    title: "5 mẹo kéo dài tuổi thọ pin điện thoại ai cũng nên biết",
    category: "thu-thuat",
    date: "2026-09-30",
    image: img("mobile-accessories/apple-iphone-charger"),
    excerpt: "Pin là linh kiện xuống cấp nhanh nhất trên điện thoại. Vài thói quen đơn giản giúp pin bền hơn đáng kể.",
    content: `
<ol>
  <li><strong>Giữ pin trong khoảng 20 - 80%</strong>: tránh để cạn kiệt hoặc sạc đầy 100% liên tục.</li>
  <li><strong>Bật tính năng sạc tối ưu</strong>: iPhone và nhiều máy Android đã có sẵn chế độ này.</li>
  <li><strong>Tránh nhiệt độ cao</strong>: không vừa sạc vừa chơi game nặng, không để máy trong ô tô nắng.</li>
  <li><strong>Dùng sạc chính hãng hoặc có chứng nhận</strong>: sạc kém chất lượng gây nóng và chai pin.</li>
  <li><strong>Giảm độ sáng và tắt ứng dụng chạy nền không cần thiết.</strong></li>
</ol>
<p>Nếu pin đã dưới 80% dung lượng, bạn có thể mang máy đến cửa hàng để được kiểm tra và thay pin chính hãng.</p>`,
  },
  {
    slug: "so-sanh-airpods-2-va-airpods-max",
    title: "So sánh AirPods 2 và AirPods Max: tai nghe nào hợp với bạn?",
    category: "danh-gia",
    date: "2026-09-21",
    image: img("mobile-accessories/apple-airpods-max-silver"),
    excerpt: "Một bên nhỏ gọn, giá dễ chịu; một bên chống ồn cao cấp. Cùng xem khác biệt giữa hai mẫu tai nghe Apple phổ biến.",
    content: `
<p><strong>AirPods 2</strong> phù hợp nghe nhạc, gọi điện hằng ngày nhờ thiết kế nhỏ gọn. <strong>AirPods Max</strong> hướng đến người cần chất âm cao cấp và chống ồn chủ động.</p>
<h2>Chất âm</h2>
<p>AirPods Max cho âm trường rộng, bass sâu và hỗ trợ âm thanh không gian. AirPods 2 đủ tốt cho nhu cầu phổ thông.</p>
<h2>Chống ồn</h2>
<p>Chỉ AirPods Max có chống ồn chủ động (ANC), rất hữu ích khi đi máy bay hoặc làm việc ở quán cà phê.</p>
<h2>Giá</h2>
<p>AirPods 2 có giá chỉ bằng khoảng 1/5 AirPods Max — lựa chọn hợp lý nếu bạn không quá khắt khe về âm thanh.</p>`,
  },
  {
    slug: "uu-dai-mua-sam-cuoi-nam",
    title: "Ưu đãi mua sắm cuối năm: giảm đến 30% laptop và phụ kiện",
    category: "khuyen-mai",
    date: "2026-09-15",
    image: img("laptops/asus-zenbook-pro-dual-screen-laptop"),
    excerpt: "Chương trình ưu đãi áp dụng cho laptop, tai nghe, sạc dự phòng cùng nhiều quà tặng hấp dẫn khi mua online.",
    content: `
<p>Nhân dịp cuối năm, Vô Thường triển khai chương trình ưu đãi dành cho khách hàng mua sắm trực tuyến.</p>
<ul>
  <li>Giảm đến <strong>30%</strong> cho một số mẫu laptop.</li>
  <li>Giảm thêm <strong>10%</strong> khi mua phụ kiện kèm điện thoại hoặc laptop.</li>
  <li><strong>Miễn phí giao hàng</strong> cho đơn từ 500.000đ.</li>
  <li>Trả góp 0% qua thẻ tín dụng.</li>
</ul>
<p>Số lượng có hạn. Xem các sản phẩm đang giảm giá tại mục <a href="/products?sort=discount">Khuyến mãi</a>.</p>`,
  },
];

const POLICIES = [
  {
    slug: "doi-tra",
    title: "Chính sách đổi trả",
    icon: "fa-sync-alt",
    summary: "1 đổi 1 trong 30 ngày nếu lỗi do nhà sản xuất.",
    content: `
<h2>Điều kiện đổi trả</h2>
<ul>
  <li>Sản phẩm lỗi kỹ thuật do nhà sản xuất trong <strong>30 ngày</strong> kể từ ngày nhận hàng: đổi mới sản phẩm cùng loại.</li>
  <li>Sản phẩm còn đầy đủ hộp, phụ kiện, quà tặng kèm (nếu có) và không bị rơi vỡ, vào nước, can thiệp phần cứng.</li>
  <li>Phụ kiện được đổi trong <strong>7 ngày</strong> nếu lỗi.</li>
</ul>
<h2>Trường hợp không áp dụng</h2>
<ul>
  <li>Sản phẩm hư hỏng do người dùng (rơi, va đập, vào nước, cháy nổ do nguồn điện).</li>
  <li>Sim, thẻ cào đã kích hoạt hoặc đã cào mã.</li>
</ul>
<h2>Quy trình</h2>
<ol>
  <li>Liên hệ hotline <strong>${COMPANY.hotline}</strong> hoặc mang sản phẩm đến cửa hàng.</li>
  <li>Kỹ thuật viên kiểm tra tình trạng sản phẩm (trong vòng 1 - 3 ngày làm việc).</li>
  <li>Đổi sản phẩm mới hoặc hoàn tiền theo thoả thuận.</li>
</ol>`,
  },
  {
    slug: "bao-hanh",
    title: "Chính sách bảo hành",
    icon: "fa-shield-alt",
    summary: "Bảo hành chính hãng 12 - 24 tháng, hỗ trợ tận nơi.",
    content: `
<h2>Thời gian bảo hành</h2>
<ul>
  <li>Điện thoại, máy tính bảng: <strong>12 tháng</strong>.</li>
  <li>Laptop: <strong>12 - 24 tháng</strong> tuỳ hãng.</li>
  <li>Điều hòa: <strong>12 tháng</strong> toàn máy, máy nén đến <strong>7 năm</strong> (tuỳ hãng).</li>
  <li>Máy in: <strong>12 tháng</strong>. Phụ kiện: <strong>6 - 12 tháng</strong>.</li>
</ul>
<h2>Cách thức bảo hành</h2>
<p>Khách hàng mang sản phẩm kèm hoá đơn mua hàng đến cửa hàng gần nhất hoặc trung tâm bảo hành chính hãng. Với điều hòa, nhân viên kỹ thuật sẽ đến tận nơi kiểm tra.</p>
<h2>Không được bảo hành</h2>
<ul>
  <li>Hết thời hạn bảo hành, tem bảo hành bị rách hoặc chỉnh sửa.</li>
  <li>Hư hỏng do thiên tai, sử dụng sai hướng dẫn, tự ý sửa chữa.</li>
</ul>`,
  },
  {
    slug: "bao-mat",
    title: "Chính sách bảo mật",
    icon: "fa-user-shield",
    summary: "Cam kết bảo vệ thông tin cá nhân của khách hàng.",
    content: `
<h2>Thông tin thu thập</h2>
<p>Chúng tôi thu thập họ tên, email, số điện thoại và địa chỉ giao hàng khi bạn đăng ký tài khoản hoặc đặt hàng.</p>
<h2>Mục đích sử dụng</h2>
<ul>
  <li>Xử lý đơn hàng, giao hàng và chăm sóc sau bán.</li>
  <li>Gửi thông tin khuyến mãi khi bạn đồng ý nhận tin.</li>
  <li>Nâng cao chất lượng dịch vụ.</li>
</ul>
<h2>Cam kết</h2>
<p>Thông tin của bạn không được bán hoặc chia sẻ cho bên thứ ba, trừ đơn vị vận chuyển và cổng thanh toán cần thiết để hoàn tất đơn hàng, hoặc khi có yêu cầu của cơ quan nhà nước có thẩm quyền.</p>
<h2>Quyền của khách hàng</h2>
<p>Bạn có thể yêu cầu xem, chỉnh sửa hoặc xoá thông tin cá nhân bằng cách liên hệ <strong>${COMPANY.email}</strong>.</p>`,
  },
  {
    slug: "khach-hang-than-thiet",
    title: "Chính sách khách hàng thân thiết",
    icon: "fa-crown",
    summary: "Tích điểm mỗi đơn hàng, nhận ưu đãi theo hạng thành viên.",
    content: `
<h2>Hạng thành viên</h2>
<ul>
  <li><strong>Thành viên</strong>: khi đăng ký tài khoản.</li>
  <li><strong>Bạc</strong>: tổng chi tiêu từ 10 triệu đồng/năm — giảm thêm 2%.</li>
  <li><strong>Vàng</strong>: từ 30 triệu đồng/năm — giảm thêm 3%, ưu tiên bảo hành.</li>
  <li><strong>Kim cương</strong>: từ 80 triệu đồng/năm — giảm thêm 5%, hỗ trợ kỹ thuật tận nơi.</li>
</ul>
<h2>Tích điểm</h2>
<p>Mỗi 100.000đ chi tiêu được tích 1 điểm. Điểm có thể dùng để đổi phiếu mua hàng hoặc quà tặng.</p>
<h2>Ưu đãi sinh nhật</h2>
<p>Tặng mã giảm giá 10% trong tháng sinh nhật cho tất cả thành viên.</p>`,
  },
];

const FAQS = [
  {
    group: "Đặt hàng & thanh toán",
    items: [
      { q: "Tôi có thể đặt hàng bằng cách nào?", a: "Bạn có thể đặt hàng trực tiếp trên website, gọi hotline 1900 1234 hoặc đến cửa hàng." },
      { q: "Website hỗ trợ những phương thức thanh toán nào?", a: "Thanh toán khi nhận hàng (COD) và chuyển khoản qua mã QR payOS." },
      { q: "Tôi có thể huỷ đơn hàng không?", a: "Bạn có thể huỷ đơn trước khi đơn được giao cho đơn vị vận chuyển bằng cách liên hệ hotline." },
    ],
  },
  {
    group: "Giao hàng",
    items: [
      { q: "Phí giao hàng là bao nhiêu?", a: "Miễn phí giao hàng cho đơn từ 500.000đ. Đơn nhỏ hơn có phí từ 20.000đ tuỳ khu vực." },
      { q: "Bao lâu tôi nhận được hàng?", a: "Nội thành giao trong 2 - 4 giờ, các tỉnh thành khác từ 2 - 5 ngày làm việc." },
    ],
  },
  {
    group: "Bảo hành & đổi trả",
    items: [
      { q: "Sản phẩm lỗi thì đổi như thế nào?", a: "Sản phẩm lỗi do nhà sản xuất được đổi mới trong 30 ngày. Xem chi tiết tại Chính sách đổi trả." },
      { q: "Tôi làm mất hoá đơn có được bảo hành không?", a: "Có. Chúng tôi tra cứu đơn hàng qua số điện thoại đặt hàng của bạn." },
    ],
  },
  {
    group: "Tài khoản",
    items: [
      { q: "Tôi quên mật khẩu thì làm sao?", a: "Chọn \"Quên mật khẩu\" ở trang đăng nhập, nhập email để nhận mã OTP và đặt lại mật khẩu." },
      { q: "Có thể đăng nhập bằng Google không?", a: "Có, bạn có thể đăng nhập nhanh bằng tài khoản Google hoặc Facebook." },
    ],
  },
];

const STORES = [
  {
    name: "Vô Thường Ngũ Hành Sơn",
    address: COMPANY.address,
    phone: COMPANY.hotline,
    hours: COMPANY.hours,
    mapQuery: "Hòa Quý, Ngũ Hành Sơn, Đà Nẵng",
    main: true,
  },
];

const JOBS = [
  { title: "Nhân viên tư vấn bán hàng", location: "Đà Nẵng", type: "Toàn thời gian", desc: "Tư vấn sản phẩm công nghệ, hỗ trợ khách hàng tại cửa hàng." },
  { title: "Kỹ thuật viên sửa chữa điện thoại", location: "Đà Nẵng", type: "Toàn thời gian", desc: "Kiểm tra, sửa chữa, bảo hành điện thoại và máy tính bảng." },
  { title: "Nhân viên chăm sóc khách hàng online", location: "Đà Nẵng / Remote", type: "Bán thời gian", desc: "Trả lời tin nhắn, hỗ trợ đơn hàng qua website và mạng xã hội." },
];

module.exports = {
  COMPANY,
  NEWS,
  NEWS_CATEGORIES,
  POLICIES,
  FAQS,
  STORES,
  JOBS,
};
