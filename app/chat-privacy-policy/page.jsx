import React from 'react'

const ChatPrivacyPolicy = () => {
    return (
        <>
            <div className="mb-10">
                <section className="bg-green-600 text-white py-16 shadow-md">
                    <div className="max-w-4xl mx-auto text-center px-4">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
                        <p className="text-lg md:text-xl opacity-90">
                            <strong>Last updated: December 20, 2025</strong>
                        </p>
                        <p className="text-lg md:text-xl opacity-90 mt-4">
                            This Privacy Policy describes how <strong>Pilot Chat</strong> (“we”, “our”, “us”) collects, uses, stores, and protects your information when you use our mobile application. By using the app, you agree to the collection and use of information in accordance with this policy.
                        </p>
                    </div>
                </section>

                <div className="max-w-5xl mx-auto px-6 md:px-12 mt-12">
                    <div className="space-y-10">
                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8 transition hover:shadow-lg">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-3">1. Information We Collect</h2>
                            <p className="text-gray-600 mb-3">
                                We collect the following types of information to provide and improve our chat services:
                            </p>
                            <h3 className="text-xl font-medium text-gray-800 mb-2">a. Personal Information</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                                <li>Name (if provided)</li>
                                <li>Email address</li>
                                <li>Phone number (if used for login)</li>
                                <li>Profile photo</li>
                            </ul>

                            <h3 className="text-xl font-medium text-gray-800 mb-2">b. Chat & User-Generated Content</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                                <li>Text messages</li>
                                <li>Images, videos, or files you send</li>
                                <li>Message timestamps</li>
                                <li>Chat metadata (sender, receiver IDs)</li>
                            </ul>
                            <p className="text-gray-600 italic">
                                Messages are stored only to enable chat functionality.
                            </p>

                            <h3 className="text-xl font-medium text-gray-800 mb-2 mt-6">c. Device & App Information</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Device type</li>
                                <li>Operating system version</li>
                                <li>App version</li>
                                <li>Crash logs (for stability and debugging)</li>
                                <li>Automatically collected usage data (e.g., IP address, device identifiers)</li>
                            </ul>
                        </div>

                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8 transition hover:shadow-lg">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-3">2. App Tracking Transparency (ATT)</h2>
                            <p className="text-gray-600">
                                For iOS users, we respect Apple’s App Tracking Transparency framework. We do not track you across apps or websites for advertising or analytics purposes without your explicit consent.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8 transition hover:shadow-lg">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-3">3. How We Use Your Information</h2>
                            <p className="text-gray-600 mb-3">
                                We use collected information solely to provide and enhance our chat services:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Create and manage user accounts</li>
                                <li>Enable real-time messaging</li>
                                <li>Deliver notifications</li>
                                <li>Improve app performance and reliability</li>
                                <li>Prevent abuse and ensure security</li>
                                <li>Comply with legal obligations</li>
                            </ul>
                            <p className="text-gray-600 mt-4 font-medium">
                                We <strong>do not sell</strong> your personal data to third parties.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8 transition hover:shadow-lg">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-3">4. Data Storage & Security</h2>
                            <p className="text-gray-600">
                                User data is stored securely using trusted cloud services (such as Firebase or secure servers). We apply industry-standard security measures (encryption, access controls) to protect your data. Access to personal data is restricted to authorized systems only.
                            </p>
                            <p className="text-gray-600 mt-3">
                                However, no method of electronic storage or transmission over the internet is 100% secure.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8 transition hover:shadow-lg">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-3">5. Sharing of Information</h2>
                            <p className="text-gray-600 mb-3">
                                We <strong>do not share</strong> your personal data with third parties except in the following limited cases:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>With trusted service providers who assist in operating the app (e.g., cloud hosting, push notifications)</li>
                                <li>When required by law or to comply with legal requests</li>
                                <li>To protect the safety and rights of users or the public</li>
                            </ul>
                        </div>

                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8 transition hover:shadow-lg">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-3">6. Notifications</h2>
                            <p className="text-gray-600">
                                We may send push notifications to inform you of new messages or important service updates. You can disable notifications at any time from your device settings.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8 transition hover:shadow-lg">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-3">7. User Control & Account Deletion</h2>
                            <p className="text-gray-600 mb-3">
                                You have the right to:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Access your personal information</li>
                                <li>Update your profile details</li>
                                <li>Delete your account permanently</li>
                            </ul>
                            <h3 className="text-xl font-medium text-gray-800 mb-2 mt-6">Account Deletion</h3>
                            <p className="text-gray-600">
                                Users can delete their account from within the app:<br />
                                <code className="bg-gray-100 px-2 py-1 rounded">Settings → Delete Account</code>
                            </p>
                            <p className="text-gray-600 mt-3">
                                When an account is deleted:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Profile data is removed</li>
                                <li>Messages are deleted or anonymized</li>
                                <li>Uploaded media is removed where applicable</li>
                            </ul>
                            <p className="text-gray-600 mt-3">
                                Some data may be retained temporarily if required by law.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8 transition hover:shadow-lg">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-3">8. Children’s Privacy</h2>
                            <p className="text-gray-600">
                                This app is <strong>not intended for children under 13</strong>. We do not knowingly collect personal information from children under 13. If you believe a child has provided personal information, please contact us immediately for removal.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8 transition hover:shadow-lg">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-3">9. Changes to This Policy</h2>
                            <p className="text-gray-600">
                                We may update this Privacy Policy from time to time. Changes will be reflected on this page with an updated “Last updated” date. We encourage you to review this policy periodically.
                            </p>
                        </div>

                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 md:p-8 transition hover:shadow-lg">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-3">10. Contact Us</h2>
                            <p className="text-gray-600">
                                If you have any questions or concerns about this Privacy Policy, please contact us:
                            </p>
                            <p className="mt-4 text-gray-700">
                                <strong>Email:</strong>{' '}
                                <a href="mailto:click4details.importer@gmail.com" className="text-green-600 hover:underline">
                                    click4details.importer@gmail.com
                                </a>
                                <br />
                                <strong>Phone:</strong>{' '}
                                <a href="tel:+8801969944400" className="text-green-600 hover:underline">
                                    +8801969944400
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ChatPrivacyPolicy