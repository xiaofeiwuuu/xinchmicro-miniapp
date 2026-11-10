// 用户协议、隐私政策、退换货规则（pages/legal/index?type=terms|privacy|returns）。中英文两份。
// **这是按系统实际功能写的模板，不是律师审过的法律文本**：运营主体全称、联系方式、售后条款里的运费和不退换情形等，
// 上线前要运营方自己核对、必要时请法务审阅（改这个文件就行，页面不用动）。
// 里面写到的天数和流程要和系统一致：待付款 15 分钟自动取消、发货后 30 天内可申请售后（AFTER_SALES_DAYS）、
// 订单保留不少于三年（电子商务法）。改了系统的参数要回来改这里。
const COMPANY = '厦门芯辰微电子有限公司';
const COMPANY_EN = 'Xiamen Xinchenwei Electronics Co., Ltd.';

export const LEGAL = {
  terms: {
    zh: {
      title: '用户协议',
      updated: '更新日期：2026 年 11 月 9 日',
      sections: [
        { h: '一、适用范围和协议构成', p: [
          `本小程序（以下简称「本服务」）由${COMPANY}（以下简称「本公司」）运营，主要向企业客户和成年人销售电子元器件等产品，并提供产品资料查询。`,
          '您使用本服务、登录账号或提交订单，即表示您已阅读、理解并同意本协议，以及《隐私政策》《退换货规则》。这三份文件共同构成您与本公司之间的约定；如果您不同意，请不要使用本服务。'
        ] },
        { h: '二、账号', p: [
          '本服务使用微信账号登录，一个微信对应一个账号。请妥善保管您的微信账号，不要出借、转让或出租；因账号使用不当产生的后果由账号使用人承担。',
          '您在「我的」页填写的昵称、手机号、收货地址、发票抬头等信息应当真实、准确、完整，信息变化时请及时更新；因信息错误造成的发货延误或错误，本公司不承担责任。',
          '您可以随时在「我的 → 注销账号」中注销账号，注销条件和结果见《隐私政策》。'
        ] },
        { h: '三、商品信息、价格和库存', p: [
          '商品名称、规格参数、价格、库存、起订量以您下单时页面显示为准。产品手册、数据表等资料用于帮助您选型，实际商品以本公司交付的实物和最新的官方规格书为准，关键参数请在下单前自行核对。',
          '同一商品的价格可能因您的会员身份、购买数量（阶梯价）而不同；订单里记录的是下单当时的价格，之后调价不影响已经下的订单。',
          '部分商品不限库存，部分商品库存有限，库存以下单成功时的实际情况为准。商品有起订量的，需要达到起订量才能下单。',
          '如果因为系统错误或明显的标价错误（比如价格明显偏离正常水平）导致价格异常，本公司有权在发货前取消相关订单并全额退款，并向您说明情况。'
        ] },
        { h: '四、下单和支付', p: [
          '本服务仅支持微信支付。提交订单后请在 15 分钟内完成支付，超时订单会自动取消，占用的库存会释放。',
          '为防止恶意占用库存，本公司对同一账号同时存在的待付款订单数量、下单频率设有限制，超出限制时请先完成或取消已有订单，或稍后再试。',
          '付款成功后订单进入「待发货」。订单金额以订单页面显示的金额为准，微信支付的交易结果以微信支付返回的为准。'
        ] },
        { h: '五、取消订单', p: [
          '待付款订单：您可以随时直接取消。',
          '已付款、还没发货的订单：您可以在订单里申请取消，需要本公司同意（可能已经在备货或打包）。同意后订单取消，款项原路退回；如果本公司已经发货，则无法取消。',
          '已发货的订单：无法取消，收到商品后如有问题可以按《退换货规则》申请售后。'
        ] },
        { h: '六、发货、签收和确认收货', p: [
          '本公司会在付款后尽快安排发货，并在订单里提供快递公司和运单号。具体发货时间受备货、库存和物流影响，本公司会尽力按时发出。',
          '收到商品请当场或尽快核对：品名、型号、数量、外包装是否完好。发现问题请尽快在订单里联系本公司或申请售后，并保留好包装和凭证。',
          '收到商品后请在订单里点击「确认收货」。发货后一定期限内（目前为 10 天）您没有确认、也没有进行中的售后的，系统会自动确认收货。'
        ] },
        { h: '七、发票', p: [
          '订单确认收货后，您可以在订单里申请开具增值税普通发票或增值税专用发票。开票信息（抬头、税号等）由您提供，您应保证其真实、准确；专用发票还需要填写完整的地址、电话、开户银行和账号。',
          '开票金额为订单实付金额减去已退款的部分。售后处理中、或订单已全额退款的，暂时不能申请开票。',
          '本公司开具后会在订单里提供电子发票供您下载。已经开具发票的订单如果发生退款，需要对原发票进行红字冲销，本公司会和您联系。'
        ] },
        { h: '八、售后', p: ['退货、退款、换货的条件、流程和费用见《退换货规则》。'] },
        { h: '九、用户行为规范', p: [
          '您不得利用本服务从事违法活动，不得恶意下单占用库存、批量注册、使用外挂或脚本、攻击或干扰系统，不得冒用他人信息，不得利用价格或系统漏洞牟利。',
          '发现上述行为，本公司有权取消相关订单、限制或终止您的账号，并保留追究责任的权利。'
        ] },
        { h: '十、知识产权', p: ['本服务中的产品资料、图片、文字、标识和页面设计等内容的知识产权归本公司或相关权利人所有。未经许可，不得复制、传播、修改或用于商业用途；产品手册仅供您在采购和使用本公司产品时参考。'] },
        { h: '十一、责任限制和不可抗力', p: [
          '因不可抗力（如自然灾害、政府行为、疫情）、网络故障、第三方服务（如微信、支付、物流）异常等本公司无法控制的原因造成的服务中断、延误或损失，本公司会尽力协助处理，但在法律允许的范围内不承担由此产生的责任。',
          '本协议的任何条款不排除或限制法律规定本公司应当承担的责任，也不排除您依法享有的权利。'
        ] },
        { h: '十二、个人信息保护', p: ['本公司如何收集、使用、保存和保护您的个人信息，以及您有哪些权利，见《隐私政策》。'] },
        { h: '十三、协议变更', p: ['本公司可能根据业务调整和法律要求更新本协议，更新后会在本页面公布并标明更新日期。如有对您权利义务有重大影响的变更，本公司会在小程序内显著提示。您在变更后继续使用本服务，即视为接受更新后的协议。'] },
        { h: '十四、适用法律和争议解决', p: ['本协议适用中华人民共和国法律。因本协议或本服务产生的争议，双方应先友好协商；协商不成的，任何一方可向本公司所在地有管辖权的人民法院提起诉讼。'] },
        { h: '十五、联系本公司', p: ['如有疑问、意见或投诉，请在「我的」页点击「联系客服」。'] }
      ]
    },
    en: {
      title: 'Terms of Service',
      updated: 'Updated: 9 November 2026',
      sections: [
        { h: '1. Scope and what makes up this agreement', p: [
          `This mini program (the "Service") is operated by ${COMPANY_EN} ("we"). We mainly sell electronic components to business customers and adults, and provide product documentation.`,
          'By using the Service, signing in or placing an order, you confirm that you have read, understood and agreed to these Terms, the Privacy Policy and the Returns Policy. Together they form the agreement between you and us. If you do not agree, please do not use the Service.'
        ] },
        { h: '2. Account', p: [
          'You sign in with your WeChat account; one WeChat account corresponds to one account here. Keep it safe and do not lend, transfer or rent it out. The account holder is responsible for consequences of improper use.',
          'The nickname, phone number, shipping address, invoice details and other information you enter on the Me page must be true, accurate and complete, and kept up to date. We are not responsible for shipping delays or errors caused by wrong information.',
          'You can delete your account at any time under Me → Delete account. See the Privacy Policy for conditions and effects.'
        ] },
        { h: '3. Product information, prices and stock', p: [
          'Product names, specifications, prices, stock and minimum order quantities are as shown when you place the order. Datasheets and other materials help you choose; the goods we deliver and our latest official datasheets prevail, so please check key parameters yourself before ordering.',
          'The price of the same product may differ by your membership and by quantity (tiered pricing). The order records the price at the time of ordering; later price changes do not affect existing orders.',
          'Some products have unlimited stock and some have limited stock; stock is as it actually is when the order is successfully placed. Products with a minimum order quantity can only be ordered at or above it.',
          'If a price is abnormal because of a system error or an obvious pricing mistake, we may cancel the related order before shipping, refund it in full and explain the situation to you.'
        ] },
        { h: '4. Orders and payment', p: [
          'Only WeChat Pay is supported. Please pay within 15 minutes after placing an order; unpaid orders are cancelled automatically and the stock is released.',
          'To prevent stock being held in bad faith, we limit how many unpaid orders one account can have at once and how often orders can be placed. If you hit a limit, finish or cancel existing orders, or try again later.',
          'After payment the order waits for shipping. The order amount is the amount shown on the order page; the payment result is as returned by WeChat Pay.'
        ] },
        { h: '5. Cancelling an order', p: [
          'Unpaid orders: you can cancel directly at any time.',
          'Paid orders not yet shipped: request cancellation in the order. It needs our approval (the goods may already be prepared or packed). If approved, the order is cancelled and refunded to the original payment method; if we have already shipped it, it cannot be cancelled.',
          'Shipped orders: cannot be cancelled. If there is a problem after receipt, request after-sales under the Returns Policy.'
        ] },
        { h: '6. Shipping, receipt and confirming receipt', p: [
          'We arrange shipping as soon as possible after payment and show the carrier and tracking number in the order. Actual dispatch time depends on preparation, stock and logistics; we will do our best to ship on time.',
          'Please check the goods on receipt or soon after: product name, model, quantity and whether the packaging is intact. If you find a problem, contact us in the order or request after-sales promptly, and keep the packaging and evidence.',
          'After receiving the goods, tap "Confirm receipt" in the order. If you do not confirm within a set period after shipping (currently 10 days) and there is no after-sales request in progress, the system confirms receipt automatically.'
        ] },
        { h: '7. Invoices', p: [
          'After you confirm receipt you can request an ordinary or special VAT invoice in the order. You provide the invoice information (title, tax ID and so on) and must ensure it is true and accurate; special invoices also need a complete address, phone, bank and account.',
          'The invoice amount is the amount actually paid minus any refunds. While after-sales is in progress, or if the order has been fully refunded, an invoice cannot be requested for now.',
          'After issuing, we provide the e-invoice in the order for download. If an order with an issued invoice is refunded, the original invoice must be reversed and we will contact you.'
        ] },
        { h: '8. After-sales', p: ['Conditions, process and costs for returns, refunds and exchanges are in the Returns Policy.'] },
        { h: '9. Acceptable use', p: [
          'You must not use the Service for anything unlawful, place bad-faith orders to hold stock, register in bulk, use bots or scripts, attack or interfere with the system, use other people\'s information, or exploit pricing or system flaws.',
          'If we find such behaviour we may cancel related orders, restrict or terminate your account, and reserve the right to pursue liability.'
        ] },
        { h: '10. Intellectual property', p: ['Product materials, images, text, marks and page design in the Service belong to us or the rights holders. They may not be copied, distributed, modified or used commercially without permission; product manuals are for your reference when buying and using our products.'] },
        { h: '11. Limitation of liability and force majeure', p: [
          'For interruptions, delays or losses caused by force majeure (such as natural disasters, government action or epidemics), network failures, or third-party services (such as WeChat, payment or logistics) beyond our control, we will help as far as we can but, within the limits of law, are not liable.',
          'Nothing in these Terms excludes or limits liability that the law requires us to bear, or rights you have by law.'
        ] },
        { h: '12. Personal information', p: ['How we collect, use, keep and protect your personal information, and your rights, are described in the Privacy Policy.'] },
        { h: '13. Changes', p: ['We may update these Terms for business changes or legal requirements, publish them on this page and show the update date. For changes that significantly affect your rights or obligations, we will notify you prominently in the mini program. Continuing to use the Service after a change means you accept the updated Terms.'] },
        { h: '14. Governing law and disputes', p: ['These Terms are governed by the laws of the People\'s Republic of China. Disputes arising from these Terms or the Service should first be settled by friendly negotiation; if that fails, either party may sue in the people\'s court with jurisdiction where we are located.'] },
        { h: '15. Contact', p: ['For questions, feedback or complaints, tap "Contact support" on the Me page.'] }
      ]
    }
  },

  privacy: {
    zh: {
      title: '隐私政策',
      updated: '更新日期：2026 年 11 月 9 日',
      sections: [
        { h: '引言', p: [
          `${COMPANY}（以下简称「本公司」）非常重视您的个人信息保护。本政策说明本公司在本小程序中收集哪些个人信息、为什么收集、怎样使用、保存和保护，以及您对自己的个人信息有哪些权利。`,
          '请您在使用本服务前仔细阅读。您使用本服务，即表示您理解并同意本公司按本政策处理您的个人信息；涉及需要您单独授权的信息（如手机号、收货地址），本公司会在您操作时单独征求您的同意。'
        ] },
        { h: '一、个人信息处理者', p: [`本服务的个人信息处理者是${COMPANY}。如对本政策或个人信息处理有疑问，请在「我的」页点击「联系客服」。`] },
        { h: '二、本公司收集的信息、场景和目的', p: [
          '1. 登录标识（openid）：您登录时，微信向本公司提供您在本小程序的 openid，用于识别您的账号、保存您的订单和资料。本公司不会获取您的微信号、微信好友、真实姓名。这是使用商城下单功能所必需的。',
          '2. 昵称、头像：只有您在「个人资料」里主动选择或填写时才收集，用于在订单和客服沟通中识别您。不提供不影响您下单。',
          '3. 手机号：只有您点击「获取手机号」并授权后，由微信提供给本公司，用于联系您处理订单、发货和售后。不提供不影响浏览，但可能影响本公司联系您。',
          '4. 收货信息（收货人、电话、地址）：您手动填写，或在「从微信导入」时授权微信提供，用于商品配送和联系收货人。这是下单所必需的。',
          '5. 发票信息：您填写的发票抬头、税号，以及（专用发票需要的）注册地址、电话、开户银行、账号，用于开具发票。只有您申请开票时才需要。',
          '6. 订单和交易信息：商品、数量、金额、订单备注、物流单号、订单状态和售后记录。付款由微信支付处理，本公司只收到交易单号、金额和支付结果，不会收集您的银行卡号、支付密码。',
          '7. 客服沟通内容：您通过微信客服与本公司沟通时提供的文字、图片，用于解答您的问题。',
          '8. 日志信息：为排查故障，小程序会记录请求失败等错误信息，仅用于定位和修复问题。'
        ] },
        { h: '三、本公司如何使用您的信息', p: [
          '1. 创建和管理账号，处理订单和付款，发货、退款和售后，开具发票。',
          '2. 向您发送您已授权的订阅消息（发货通知、订单取消通知、发票开具通知）。订阅消息需要您每次授权，您可以拒绝，不影响下单。',
          '3. 提供客户服务，解答咨询，处理投诉。',
          '4. 保障交易和账号安全，防范恶意下单、占用库存等行为，排查和修复故障。',
          '5. 本公司的客服、发货、财务等工作人员会在工作需要的范围内查看订单和客户信息，仅限工作用途。',
          '本公司不会向您推送广告，不会进行用户画像和个性化推荐，也不会将您的信息用于上述目的以外的用途；如需用于其他用途，会再次征求您的同意。'
        ] },
        { h: '四、本公司如何共享、委托处理、转让和公开披露', p: [
          '本公司不会出售您的个人信息，也不会公开披露。只有在下面的情况才会提供给第三方：',
          '1. 微信支付（财付通）：完成付款和退款所必需。',
          '2. 快递公司：为配送商品，把您的收货人、电话和地址提供给承运的快递公司。',
          '3. 腾讯云：本服务的数据存放在腾讯云（微信云托管、云数据库、云存储）上，本公司委托其提供存储和运行服务，数据位于中华人民共和国境内，本公司不会将您的个人信息传输到境外。',
          '4. 法律法规要求，或司法、行政机关依法要求提供的情形。',
          '5. 本公司发生合并、分立、收购等情形导致个人信息需要转移时，本公司会告知您接收方的名称和联系方式，接收方继续受本政策约束，否则会重新征求您的同意。'
        ] },
        { h: '五、本公司如何保存您的信息', p: [
          '账号资料（昵称、头像、手机号、收货地址、发票抬头）保存到您注销账号为止。',
          '订单、支付、发票和售后等交易信息，依照《电子商务法》等法律要求，保存不少于三年。您注销账号后，订单里下单时记录的收货人、电话和地址会随订单保留到法定期限届满，期满后删除或匿名化。',
          '日志信息仅在排查和修复故障所需的期限内保存。'
        ] },
        { h: '六、本公司如何保护您的信息', p: ['本公司采取合理的安全措施保护您的个人信息，包括传输加密、访问控制、区分后台账号权限、后台操作留痕等。但互联网并非绝对安全，如发生个人信息安全事件，本公司会按法律要求及时告知您事件的情况、可能的影响和本公司已采取或将采取的措施，并向监管部门报告。'] },
        { h: '七、您的权利', p: [
          '1. 查看和更正：在「我的 → 个人资料」「收货地址」「发票抬头」里查看和修改您的信息。',
          '2. 删除和注销：在「我的 → 注销账号」。注销前需要完成没有结束的订单、售后、开票和退款。注销后本公司会清除您的昵称、头像、手机号、收货地址、发票抬头和订阅授权，账号无法恢复；订单按第五条的规定保留。',
          '3. 撤回授权：您可以在微信的小程序设置里关闭手机号、地址等授权，或不再授权订阅消息。撤回授权不影响撤回前基于授权已进行的处理。',
          '4. 获取副本和咨询：如需获取您的个人信息副本，或对个人信息处理有疑问，请联系客服，本公司会在 15 个工作日内回复。',
          '5. 投诉：如您认为本公司处理个人信息的行为侵害了您的权益，可以联系客服投诉，也可以向有关监管部门投诉。'
        ] },
        { h: '八、未成年人', p: ['本服务面向企业和成年人，本公司不主动向未满 18 周岁的未成年人提供服务，也不会在知情的情况下收集其个人信息。如果您是未成年人的监护人，发现未成年人向本公司提供了个人信息，请联系本公司删除。'] },
        { h: '九、本政策的更新', p: ['本公司可能因业务调整或法律要求更新本政策，更新后会在本页面公布并标明更新日期。涉及处理目的、范围、方式等重大变化时，本公司会在小程序内显著提示，需要您同意的会重新征求同意。'] },
        { h: '十、联系本公司', p: ['如对本政策有疑问、意见或投诉，请在「我的」页点击「联系客服」。'] }
      ]
    },
    en: {
      title: 'Privacy Policy',
      updated: 'Updated: 9 November 2026',
      sections: [
        { h: 'Introduction', p: [
          `${COMPANY_EN} ("we") takes your personal information seriously. This policy explains what personal information we collect in this mini program, why, how we use, keep and protect it, and what rights you have over it.`,
          'Please read it before using the Service. By using the Service you understand and agree that we process your personal information as described here. For information that needs your separate authorisation (such as your phone number or address), we ask for your consent when you take the action.'
        ] },
        { h: '1. Who processes your information', p: [`The personal information processor of this Service is ${COMPANY_EN}. If you have questions about this policy or how your information is processed, tap "Contact support" on the Me page.`] },
        { h: '2. What we collect, when and why', p: [
          '1. Sign-in identifier (openid): when you sign in, WeChat gives us your openid for this mini program, used to recognise your account and keep your orders and profile. We do not get your WeChat ID, your contacts or your real name. This is required to order.',
          '2. Nickname and avatar: only if you choose or enter them in "Profile"; used to identify you in orders and support. Not providing them does not stop you from ordering.',
          '3. Phone number: only after you tap "Get phone number" and authorise; provided by WeChat and used to contact you about orders, shipping and after-sales. Not providing it does not affect browsing, but may affect our ability to contact you.',
          '4. Shipping details (recipient, phone, address): entered by you, or provided by WeChat when you choose "Import from WeChat" and authorise; used for delivery and contacting the recipient. Required to order.',
          '5. Invoice details: the invoice title and tax ID you enter, plus (for special invoices) registered address, phone, bank and account; used to issue invoices. Only needed when you request an invoice.',
          '6. Order and transaction information: products, quantities, amounts, order remarks, tracking numbers, order status and after-sales records. Payment is handled by WeChat Pay; we only receive the transaction ID, amount and result, never your bank card number or payment password.',
          '7. Support conversations: the text and images you send through WeChat customer service, used to answer your questions.',
          '8. Logs: to troubleshoot problems the mini program records errors such as failed requests, used only to locate and fix problems.'
        ] },
        { h: '3. How we use your information', p: [
          '1. Create and manage your account, process orders and payments, ship, refund, handle after-sales and issue invoices.',
          '2. Send the subscription messages you authorised (shipping, cancellation and invoice notices). Each message needs your authorisation; you may decline without affecting ordering.',
          '3. Provide support, answer enquiries and handle complaints.',
          '4. Keep transactions and accounts secure, prevent bad-faith orders and stock holding, and troubleshoot.',
          '5. Our support, shipping and finance staff view order and customer information only as needed for their work.',
          'We do not send you ads, do not profile you or personalise recommendations, and do not use your information for anything beyond the above. For any other use we will ask for your consent again.'
        ] },
        { h: '4. Sharing, processors, transfer and disclosure', p: [
          'We do not sell your personal information and do not disclose it publicly. We provide it to third parties only in these cases:',
          '1. WeChat Pay (Tenpay): required to complete payments and refunds.',
          '2. Couriers: your recipient name, phone and address are given to the courier delivering your order.',
          '3. Tencent Cloud: our data is stored on Tencent Cloud (WeChat Cloud Hosting, cloud database and storage), which we engage to provide storage and hosting. The data is located in mainland China and we do not transfer your personal information abroad.',
          '4. Where laws require, or judicial or administrative authorities lawfully request it.',
          '5. If a merger, split or acquisition requires your information to be transferred, we will tell you the recipient\'s name and contact details; the recipient remains bound by this policy, otherwise we will ask for your consent again.'
        ] },
        { h: '5. How long we keep it', p: [
          'Account information (nickname, avatar, phone, addresses, invoice titles) is kept until you delete your account.',
          'Order, payment, invoice and after-sales records are kept for at least three years as required by the E-Commerce Law. After you delete your account, the recipient, phone and address recorded in your orders at the time of ordering are kept with the orders until the legal period ends, then deleted or anonymised.',
          'Log information is kept only as long as needed to troubleshoot and fix problems.'
        ] },
        { h: '6. How we protect it', p: ['We use reasonable security measures to protect your personal information, including encryption in transit, access control, separate permissions for back-office accounts and audit trails of back-office actions. The internet is not perfectly secure; if a personal information security incident occurs, we will promptly tell you what happened, the possible impact and the measures we have taken or will take, as the law requires, and report it to the regulator.'] },
        { h: '7. Your rights', p: [
          '1. View and correct: under Me → Profile, Addresses and Invoice titles.',
          '2. Delete and close your account: under Me → Delete account. Before deleting, finish any open orders, after-sales, invoice requests and refunds. After deletion we erase your nickname, avatar, phone, addresses, invoice titles and subscription authorisations; the account cannot be restored, and orders are kept as described in section 5.',
          '3. Withdraw permissions: turn off phone or address permissions in WeChat\'s mini program settings, or stop authorising subscription messages. Withdrawing does not affect processing already carried out on the basis of earlier authorisation.',
          '4. Copies and questions: to get a copy of your personal information or ask about how it is processed, contact support; we reply within 15 working days.',
          '5. Complaints: if you believe our handling of your personal information infringes your rights, you can complain to us through support, or to the relevant regulator.'
        ] },
        { h: '8. Minors', p: ['The Service is for businesses and adults. We do not knowingly offer it to or collect personal information from people under 18. If you are a guardian and find that a minor has given us personal information, please contact us to delete it.'] },
        { h: '9. Updates to this policy', p: ['We may update this policy for business changes or legal requirements, publish it on this page and show the update date. For material changes to purposes, scope or methods of processing we will notify you prominently in the mini program, and ask for your consent again where required.'] },
        { h: '10. Contact', p: ['If you have questions, feedback or complaints about this policy, tap "Contact support" on the Me page.'] }
      ]
    }
  },

  returns: {
    zh: {
      title: '退换货规则',
      updated: '更新日期：2026 年 11 月 9 日',
      sections: [
        { h: '一、适用范围', p: ['本规则适用于您在本小程序下单购买的商品，包括取消订单、退货、退款和换货。请在下单前阅读。'] },
        { h: '二、取消订单', p: [
          '待付款：您可以随时直接取消；超过 15 分钟没有付款，系统会自动取消。',
          '已付款、还没发货：在订单里点「申请取消」并选择原因，本公司同意后订单取消并原路退款。本公司会尽快处理；如果本公司已经发货，就无法取消，收到商品后可以申请售后。您可以在订单里看到处理进度。',
          '已发货：无法取消。'
        ] },
        { h: '三、售后的条件', p: [
          '1. 订单已完成（您已确认收货，或系统自动确认收货）。',
          '2. 在发货后 30 天内提出申请。',
          '3. 同一订单同一时间只能有一个处理中的售后申请；订单已经全额退款的，不能再申请。',
          '超过 30 天的申请，本公司会根据实际情况和您协商处理。'
        ] },
        { h: '四、售后的类型', p: [
          '仅退款：商品没收到、缺发少发、或双方协商同意不退货的退款。',
          '退货退款：商品需要退回，本公司收到并验货后退款。',
          '换货：商品需要退回，本公司收到并验货后寄出新商品。',
          '申请时请选择类型和原因，并写明具体情况（比如型号、数量、问题描述），必要时联系客服补充照片等凭证。'
        ] },
        { h: '五、申请和处理流程', p: [
          '1. 您在订单里点「申请售后」提交申请，本公司会审核并在订单里告知结果，通常在 3 个工作日内处理。',
          '2. 仅退款：同意后本公司直接向您的微信支付原路退款，退款金额由本公司根据实际情况确认，可以是部分金额。',
          '3. 退货退款、换货：同意后订单里会显示退货收件人、电话和地址。请按这个地址寄回，寄出后在订单里填写快递公司和运单号，并保留好寄件凭证。**请不要在本公司同意之前寄回商品**，也不要寄到其他地址，否则可能无法处理。',
          '4. 本公司收到退回的商品并验货无误后，办理退款或寄出新商品。验货不通过的，本公司会在订单里说明原因。',
          '5. 在本公司处理之前，您可以随时撤销申请。'
        ] },
        { h: '六、退货的要求', p: [
          '申请退货的商品应保持原包装、型号和数量与订单一致、配件和资料齐全，没有使用、拆封后不影响二次销售、没有人为损坏。',
          '电子元器件对静电、潮湿、焊接等很敏感，已经焊接、通电使用、或因存放和使用不当造成损坏的商品，本公司有权不予退换。'
        ] },
        { h: '七、退款的方式和时间', p: [
          '退款会原路退回您付款使用的微信支付，不会退到其他账户。',
          '本公司同意退款后会立即向微信支付发起退款，通常 1 到 7 个工作日到账，具体以微信支付和银行为准。您可以在订单里查看退款进度。',
          '商品享受了会员价或阶梯价的，退款金额以订单里该商品实际支付的金额为准。',
          '已开具发票的订单，退款后原发票需要红字冲销，本公司会和您联系办理。'
        ] },
        { h: '八、运费', p: [
          '因商品质量问题或本公司发错货、少发货产生的退货运费，由本公司承担。',
          '因您自己的原因（如型号选错、不想要了）退货的，退货运费由您承担。',
          '具体以本公司在订单里同意售后时写明的为准。请先和本公司确认运费再寄出，避免产生不必要的费用。'
        ] },
        { h: '九、不予退换的情形', p: [
          '1. 商品已经使用、焊接、拆封后影响二次销售，或因人为原因损坏。',
          '2. 商品与订单不一致，或缺少配件、包装，且无法恢复。',
          '3. 没有经过本公司同意擅自退回。',
          '4. 超过售后期限，且本公司与您没有协商一致。',
          '如对处理结果有异议，您可以联系客服说明情况，本公司会再次核实。'
        ] },
        { h: '十、联系本公司', p: ['对规则或处理结果有疑问，请在「我的」页点击「联系客服」。'] }
      ]
    },
    en: {
      title: 'Returns Policy',
      updated: 'Updated: 9 November 2026',
      sections: [
        { h: '1. Scope', p: ['This policy applies to goods you buy in this mini program, covering order cancellation, returns, refunds and exchanges. Please read it before ordering.'] },
        { h: '2. Cancelling an order', p: [
          'Unpaid: you can cancel directly at any time; if unpaid after 15 minutes, the system cancels it.',
          'Paid, not yet shipped: tap "Request cancel" in the order and choose a reason. If we approve, the order is cancelled and refunded to the original payment method. We handle it as soon as we can; if we have already shipped it, it cannot be cancelled, but you can request after-sales once you receive it. You can follow progress in the order.',
          'Shipped: cannot be cancelled.'
        ] },
        { h: '3. After-sales conditions', p: [
          '1. The order is completed (you confirmed receipt, or the system confirmed it automatically).',
          '2. You apply within 30 days of shipping.',
          '3. An order can have only one open after-sales request at a time; an order that has been fully refunded cannot apply again.',
          'For requests past 30 days we will handle them case by case through discussion with you.'
        ] },
        { h: '4. Types of after-sales', p: [
          'Refund only: goods not received, missing or short shipment, or a refund without returning the goods that we agree to.',
          'Return and refund: the goods are returned, and we refund after receiving and inspecting them.',
          'Exchange: the goods are returned, and we send replacements after receiving and inspecting them.',
          'Please choose the type and reason and describe the details (model, quantity, the problem). If needed, contact support to add photos or other evidence.'
        ] },
        { h: '5. Process', p: [
          '1. Tap "Request after-sales" in the order. We review it and tell you the result in the order, usually within 3 working days.',
          '2. Refund only: if approved, we refund to your WeChat Pay directly. We confirm the amount based on the facts; it may be partial.',
          '3. Return and refund, exchange: if approved, the order shows the return recipient, phone and address. Ship to that address, then enter the carrier and tracking number in the order and keep your shipping receipt. **Please do not ship goods back before we approve**, and do not send them to any other address, otherwise we may be unable to process them.',
          '4. After we receive the goods and inspect them without problems, we refund or send replacements. If an inspection fails, we explain why in the order.',
          '5. You can withdraw the request any time before we handle it.'
        ] },
        { h: '6. Requirements for returned goods', p: [
          'Returned goods should be in the original packaging, match the order in model and quantity, include accessories and documents, be unused, not opened in a way that prevents resale, and not damaged by the user.',
          'Electronic components are sensitive to static, moisture and soldering. We may refuse returns or exchanges for goods that have been soldered, powered, or damaged by improper storage or use.'
        ] },
        { h: '7. Refund method and timing', p: [
          'Refunds go back to the WeChat Pay you paid with, never to another account.',
          'After we approve a refund we submit it to WeChat Pay immediately; it usually arrives within 1 to 7 working days, subject to WeChat Pay and your bank. You can follow progress in the order.',
          'If a product was bought at a member or tiered price, the refund is based on the amount actually paid for it in the order.',
          'For orders with an issued invoice, the invoice must be reversed after a refund; we will contact you to arrange it.'
        ] },
        { h: '8. Shipping costs', p: [
          'Return shipping caused by a product quality problem or our shipping the wrong or short item is on us.',
          'If you return goods for your own reasons (such as choosing the wrong model or changing your mind), return shipping is on you.',
          'What we state in the order when approving after-sales applies. Please confirm shipping costs with us before sending, to avoid unnecessary charges.'
        ] },
        { h: '9. When returns are not accepted', p: [
          '1. The goods have been used or soldered, opened in a way that prevents resale, or damaged by the user.',
          '2. The goods do not match the order, or accessories or packaging are missing and cannot be restored.',
          '3. The goods were sent back without our approval.',
          '4. The after-sales period has passed and we have not agreed otherwise with you.',
          'If you disagree with a decision, contact support and explain; we will review it again.'
        ] },
        { h: '10. Contact', p: ['If you have questions about this policy or a decision, tap "Contact support" on the Me page.'] }
      ]
    }
  }
};

export const LEGAL_TYPES = ['terms', 'privacy', 'returns'];

// 后台富文本（服务端已清洗）放进 <rich-text> 前加上深色背景下的样式：外面包一层浅色文字，表格加边框。
// rich-text 里的内容不继承页面样式，所以颜色、行距都要写成行内样式；单位用 px（rich-text 对 rpx 的支持不确定）
export function styleRichHtml(html) {
  const border = 'border:1px solid rgba(255,255,255,0.25);padding:6px 8px;';
  const withStyle = String(html || '').replace(/<(table|td|th)\b([^>]*)>/g, (m, tag, attrs) => {
    const extra = tag === 'table' ? 'border-collapse:collapse;max-width:100%;' : border;
    return /\bstyle="/.test(attrs) ? `<${tag}${attrs.replace(/\bstyle="/, `style="${extra}`)}>` : `<${tag}${attrs} style="${extra}">`;
  });
  return `<div style="color:rgba(255,255,255,0.8);font-size:14px;line-height:1.8;word-break:break-all;">${withStyle}</div>`;
}

// 当前语言的内容；没有的类型返回 null
export function getLegal(type, lang) {
  const doc = LEGAL[type];
  if (!doc) return null;
  return doc[lang === 'en' ? 'en' : 'zh'];
}
