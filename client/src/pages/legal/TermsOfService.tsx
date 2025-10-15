import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle } from 'lucide-react';

function TermsOfService() {
  const currentVersion = 'v2.0';
  const effectiveDate = 'October 15, 2025';
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground">Version {currentVersion} | Effective Date: {effectiveDate}</p>
      </div>

      <Card className="border-amber-300 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">
              <strong>Important Notice:</strong> These Terms include limitations on liability, a release of claims, an indemnification obligation, and an arbitration agreement. Please read carefully.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>1. Marketplace; No Provider of Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            My Pup, Inc. ("My Pup") is a marketplace platform that enables pet owners and third-party providers (e.g., sitters, walkers, groomers, breeders) to find, communicate, and transact. My Pup is not a party to any agreement between users, does not provide pet-related services, does not supervise or control users, and does not guarantee quality, safety, insurance coverage, background checks, or legal compliance of any user or service.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Independent Users; No Employment/Agency</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Users act solely as independent parties. No joint venture, partnership, employment, or agency relationship is created between My Pup and any user or between users. Users are exclusively responsible for their acts, omissions, and representations.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Assumption of Risk; Animal Behavior</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Users acknowledge that animals can be unpredictable and may cause injury, property damage, illness, or death. By using the platform or engaging in services, you voluntarily assume all risks associated with animal handling, transportation, boarding, grooming, breeding, training, or related activities.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Release & Covenant Not to Sue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            To the maximum extent permitted by law, you release and forever discharge My Pup, its affiliates, and their officers, directors, employees, and agents from any and all claims, demands, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or relating to:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>(a) interactions or contracts between users;</li>
            <li>(b) injuries to persons or animals;</li>
            <li>(c) damage or loss to property; or</li>
            <li>(d) disputes, misrepresentations, or conduct of any user.</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-4">
            This release does not waive claims that cannot be waived by law (e.g., gross negligence or willful misconduct where such waiver is prohibited).
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Indemnification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            You agree to defend, indemnify, and hold harmless My Pup from and against any third-party claims, damages, obligations, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising from or related to: (i) your use of the platform or services; (ii) your breach of these Terms; (iii) your violation of law or the rights of any person; or (iv) any injury or damage to persons, animals, or property in connection with services you offer or receive.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. No Medical, Legal, or Insurance Advice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            My Pup does not provide veterinary, medical, legal, or insurance advice. You are solely responsible for obtaining any required licenses, permits, or insurance and for evaluating whether another user maintains adequate qualifications or coverage.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>7. Emergency Care & Costs Between Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Users engaging in services are solely responsible for arranging emergency protocols (e.g., veterinary care authorization, cost responsibility, and reimbursement). My Pup is not responsible for coordinating or paying for emergency services unless required by law.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>8. Payments; Platform Role</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Payments may be processed by third-party providers (e.g., Stripe). My Pup is a platform and not a bank, money transmitter, or insurer. Refunds, chargebacks, taxes, and fee obligations are handled per the applicable payment terms and the agreement between users.
          </p>
        </CardContent>
      </Card>

      <Card className="border-red-300 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-900">9. Disclaimers; Limitation of Liability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <p className="uppercase font-semibold text-red-900">
              THE PLATFORM AND CONTENT ARE PROVIDED "AS IS" AND "AS AVAILABLE." TO THE MAXIMUM EXTENT PERMITTED BY LAW, MY PUP DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className="uppercase font-semibold text-red-900">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, MY PUP SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL, ARISING OUT OF OR RELATING TO THE PLATFORM OR SERVICES.
            </p>
            <p className="uppercase font-semibold text-red-900">
              IN NO EVENT WILL MY PUP'S TOTAL LIABILITY EXCEED THE GREATER OF: (A) THE AMOUNT YOU PAID TO MY PUP IN FEES DURING THE TWELVE (12) MONTHS PRIOR TO THE EVENT GIVING RISE TO LIABILITY; OR (B) US $100.
            </p>
            <p className="text-sm text-red-800 mt-4">
              Nothing herein limits liability where such limitation is prohibited by law.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-300 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">10. Dispute Resolution; Arbitration; Class-Action Waiver</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="font-semibold text-blue-900">PLEASE READ THIS SECTION CAREFULLY. It requires binding arbitration and affects your rights.</p>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-blue-900">(a) Informal Resolution</h4>
              <p className="text-blue-800">
                Before filing a claim, the parties will attempt in good faith to resolve disputes by emailing contact@mypup.com with "Dispute Notice" and a description of the claim.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-900">(b) Arbitration</h4>
              <p className="text-blue-800">
                If not resolved within 30 days, disputes will be finally resolved by binding arbitration administered by the American Arbitration Association (AAA) under its rules. Venue: Travis County, Texas. The arbitrator may award individual relief only.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-900">(c) Class-Action Waiver</h4>
              <p className="text-blue-800 uppercase font-semibold">
                Claims must be brought in an individual capacity only and not as a plaintiff or class member in any purported class, collective, or representative proceeding.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-900">(d) Opt-Out</h4>
              <p className="text-blue-800">
                You may opt out of arbitration by mailing written notice to My Pup, Inc., Austin, Texas within 30 days of your first acceptance of these Terms.
              </p>
            </div>

            <p className="text-sm text-blue-800 mt-4">
              If arbitration/class-action waivers are not enforceable in your locale, the parties agree to the exclusive jurisdiction of the state and federal courts located in Travis County, Texas.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>11. Safety Expectations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Users agree to follow reasonable safety practices, comply with applicable laws and animal-welfare regulations, and immediately report unsafe conduct, suspected abuse, or policy violations through in-app reporting or email to safety@mypup.com. My Pup may, in its discretion, suspend or terminate accounts.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>12. Governing Law; Severability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            These Terms are governed by the laws of the State of Texas, without regard to conflict-of-law rules. If any provision is found unenforceable, it will be modified to the minimum extent necessary, and the remainder will continue in full force.
          </p>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>If you have questions about these terms, please contact us:</p>
          <ul className="space-y-1">
            <li><strong>Legal:</strong> legal@mypup.com</li>
            <li><strong>Support:</strong> support@mypup.com</li>
            <li><strong>Safety:</strong> safety@mypup.com</li>
            <li><strong>Disputes:</strong> contact@mypup.com (subject: "Dispute Notice")</li>
            <li><strong>Address:</strong> My Pup, Inc., Austin, Texas</li>
          </ul>
        </CardContent>
      </Card>
      
      <div className="text-center text-sm text-muted-foreground pb-8">
        <p>By using My Pup, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
        <p className="mt-2">Version {currentVersion} | Effective {effectiveDate}</p>
      </div>
    </div>
  );
}

export default TermsOfService;
