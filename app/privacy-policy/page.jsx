import React from 'react'

const PrivacePolicy = () => {
    return (
        <>
            <div className="mb-10">
                <section className="bg-green-600 text-white py-16 shadow-md">
                    <div className="max-w-4xl mx-auto text-center px-4">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
                        <p className="text-lg md:text-xl opacity-90">
                            We value your privacy and are committed to protecting your personal information.
                        </p>
                    </div>
                </section>

               <div className="max-w-5xl mx-auto px-6 md:px-12 mt-12">
                    <div className="space-y-10">

                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8 transition hover:shadow-lg">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-3">1. Information We Collect</h2>
                            <p className="text-gray-600 mb-3">
                                Users can browse products and content without creating an account. Personal information such as Name, Email Address, and Phone Number is only collected when users register or place an order.
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li><strong>Personal Information:</strong> Name, email, phone number, payment details, etc.</li>
                                <li><strong>User-Generated Content:</strong> Text, images, videos, comments you upload.</li>
                                <li><strong>Automatically Collected:</strong> Device information, cookies, and usage data.</li>
                            </ul>
                        </div>

                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8 transition hover:shadow-lg">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-3">2. App Tracking Transparency (ATT)</h2>
                            <p className="text-gray-600">
                                For iOS users, if the app uses tracking for analytics or advertising, we request permission using Apple’s App Tracking Transparency framework. The app will not track users without explicit consent.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8 transition hover:shadow-lg">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-3">3. How We Use Your Information</h2>
                            <p className="text-gray-600 mb-3">
                                We collect personal data only for account-related functions such as order processing and customer support. Tracking data will only be collected if the user grants permission via the iOS App Tracking Transparency prompt.
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Provide and improve our services.</li>
                                <li>Facilitate purchases and transactions.</li>
                                <li>Communicate with you regarding updates, offers, and support.</li>
                                <li>Monitor compliance with our Terms and Conditions.</li>
                                <li>Protect the security of our website and application.</li>
                            </ul>
                        </div>

                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8 transition hover:shadow-lg">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-3">4. Sharing of Information</h2>
                            <p className="text-gray-600 mb-3">
                                We do not sell or rent your personal information. However, we may share information:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>With service providers to facilitate transactions.</li>
                                <li>With law enforcement when required by law or to protect our rights.</li>
                                <li>With your consent for third-party sharing.</li>
                                <li>We may share non-personal data with third-party service providers for analytics and performance improvement. User tracking will only occur if explicit consent is provided via Apple’s App Tracking Transparency framework.</li>
                            </ul>
                        </div>

                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8 transition hover:shadow-lg">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-3">5. Cookies and Tracking Technologies</h2>
                            <p className="text-gray-600">
                                We use cookies to enhance your experience and gather analytics. You can manage cookie preferences through your browser settings.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8 transition hover:shadow-lg">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-3">6. Data Security</h2>
                            <p className="text-gray-600">
                                We take reasonable measures to secure your data, but we cannot guarantee absolute security over the internet.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8 transition hover:shadow-lg">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-3">7. Your Responsibilities</h2>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Maintain the security of your account credentials.</li>
                                <li>Avoid uploading unlawful or offensive content.</li>
                            </ul>
                        </div>

                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8 transition hover:shadow-lg">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-3">8. Third-Party Links</h2>
                            <p className="text-gray-600">
                                Our website may contain links to external sites. We are not responsible for the privacy practices of these sites.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8 transition hover:shadow-lg">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-3">9. Children’s Privacy</h2>
                            <p className="text-gray-600">
                                Our services are not intended for individuals under the age of 18. We do not knowingly collect data from children.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8 transition hover:shadow-lg">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-3">10. Your Rights</h2>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Access, correct, or delete your personal data.</li>
                                <li>Withdraw consent for certain data processing activities.</li>
                            </ul>
                            <p className="text-gray-600 mt-2">
                                To exercise these rights, please contact us at
                                <a href="mailto:pilotbazar.com@gmail.com" className="text-green-600 hover:underline">pilotbazar.com@gmail.com</a>.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8 transition hover:shadow-lg">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-3">11. User-Generated Content and Public Use</h2>
                            <p className="text-gray-600">
                                Any content you upload to our platform may be publicly visible. By using our services, you agree to the public display of your content.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8 transition hover:shadow-lg">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-3">12. Changes to This Policy</h2>
                            <p className="text-gray-600">
                                We may update this Privacy Policy from time to time. Changes will be effective immediately upon posting. Please check periodically for updates.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8 transition hover:shadow-lg">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-3">13. Contact Us</h2>
                            <p className="text-gray-600">
                                For questions or concerns regarding this Privacy Policy, please contact us:
                            </p>
                            <p className="mt-2 text-gray-700">
                                <strong>Email:</strong>
                                <a href="mailto:pilotbazar.com@gmail.com" className="text-green-600 hover:underline">pilotbazar.com@gmail.com</a><br/>
                                    <strong>Phone:</strong>
                                    <a href="tel:+8801969944400" className="text-green-600 hover:underline">+8801969944400</a>
                            </p>
                        </div>
                    </div>
                </div> 
            </div>
        </>
    )
}

export default PrivacePolicy
