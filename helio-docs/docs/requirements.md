# 📝 Requirements Specification

---

# Software Requirements Specification (SRS)

---

## 1. Introduction

### 1.1 Purpose

Helio is an internal portal for managing reimbursements and vendor payments for events organized by ACM. It streamlines the process for invited guests and service vendors to submit claims and receive payments efficiently.

### 1.2 Scope

Helio will support expense and bill submissions, approval workflows, document uploads, role-based access, and status tracking. It will not handle payroll, ticket booking, or accounting.

### 1.3 Definitions, Acronyms, and Abbreviations

| Term  | Description                               |
| ----- | ----------------------------------------- |
| KYC   | Know Your Customer                        |
| ACM   | Association for Computing Machinery       |
| Claim | A reimbursement or vendor payment request |

---

## 2. Overall Description

### 2.1 Product Perspective

Helio is a standalone web-based portal designed to manage reimbursements and vendor payments for events organized by ACM. It acts as a centralized system where invitees and vendors can submit their claims, upload relevant documents, and track the approval and payment status.

The system includes role-based access control for different user types such as Admins, Finance Team, Invitees, and Vendors. It integrates with email services for notifications and uses cloud storage (e.g., AWS S3) for managing uploaded bills and documents. Helio is not part of any larger system but can be extended in the future to integrate with external accounting or ERP platforms.

### 2.2 Product Features

High-level features:

- Role-based access (Admin, Operator, Vendor, Invitee)
- Document based KYC for vendors and invitees
- Submit and manage claims
- Attach bills and supporting documents
- Approval and payment workflow for finance team
- Notifications (email + dashboard)

### 2.3 User Classes and Characteristics

| Role     | Description                                   |
| -------- | --------------------------------------------- |
| Admin    | Full access, configures system, manages users |
| Operator | Reviews, approves, or rejects claims          |
| Invitee  | Submits reimbursements                        |
| Vendor   | Submits service payment requests              |

### 2.4 Operating Environment

- Web-based (responsive for mobile)
- Stack: MERN Stack + AWS S3
- Hosted on Vercel

---

## 3. Functional Requirements

### 3.1 User Management

#### 3.1.1 Account Creation and Verification

- **ID:** FR-001
- **Description:** Admin shall create new accounts for the role of `Admin` and `Operator`
- **Acceptance Criteria:**
  - A user with the role `Admin` is able to create new accounts with role `Admin` and `Operator`
  - Newly created accounts can be successfully logged in with correct credentials

---

- **ID:** FR-003
- **Description:** Claimants i.e. accounts with either role as `Invitee` or `Vendor` shall be able to create accounts through the application's signup process
- **Acceptance Criteria:**
  - Newly created accounts with roles `Invitee` and `Vendor` are able to successfully login to the application through correct credentials

---

- **ID:** FR-004
- **Description:** Upon signup, claimant accounts shall undergo email verification. A verification email containing a unique and time-bound link shall be sent to the registered email address. The account shall be considered verified upon activation of the verification link.
- **Acceptance Criteria:**
  - A verification email is sent to the claimant upon successful signup.
  - The email contains a unique verification link associated with a time-bound token.
  - When the claimant activates the link:
    - If the token is valid and unexpired, the account is marked as verified.
    - If the token is expired or invalid, the system rejects the request and prompt the user to request a new verification email.
  - The account is marked as verified only upon successful activation of the link.
  - Unverified accounts are restricted from logging in and accessing protected features.

---

- **ID:** FR-005
- **Description:** Claimants shall be able to request a resend of the verification email in case the original link is not received or has expired.
- **Acceptance Criteria:**
  - A "Resend Verification Email" option is available on the login or verification prompt screen for unverified accounts.
  - Upon request, a new verification email with a fresh time-bound link is sent to the claimant's registered email.

---

#### 3.1.2 Account Login

- **ID:** FR-006
- **Description:** All types of users irrespective of their role shall be able to log in to the application using their registered email and password.
- **Acceptance Criteria:**
  - Users with valid credentials are successfully authenticated and granted access to the application.
  - Users with invalid credentials are denied access and shown an appropriate error message.
  - Claimant accounts are not able to login prior to email verification.

---

#### 3.1.3 Password Change/Reset

- **ID:** FR-007
- **Description:** All types of users shall be able to reset their password through a forgot password option at login
- **Acceptance Criteria:**
  - User receives a password reset link at their registered email upon submitting the request.
  - The reset link is time-bound and allow the user to set a new password.
  - Users are able to log in with the new password after a successful reset.

---

- **ID:** FR-008
- **Description:** Logged-in users shall be able to change their password from within the application.
- **Acceptance Criteria:**
  - The user shall be required to enter their current password to initiate the password change.
  - Upon successful password change, the user is able to log in using the new password.

---

#### 3.1.4 Account Maintainence

- **ID:** FR-009
- **Description:** Logged-in users with role `Vendor` or `Invitee` shall be able to update their profile information, limited to name, phone number and email.
- **Acceptance Criteria:**
  - Users are able to update their name, phone number and email from the profile settings.
  - If the email is changed, a verification email containing a time-bound tokenized link is sent to the new address.
  - The email change takes effect only after the new email is verified via the link.
  - Until verification, the old email remains associated with the account.

---

- **ID:** FR-010
- **Description:** Logged-in users shall be able to request deletion of their account, which shall be processed as a soft delete.
- **Acceptance Criteria:**
  - Users are able to initiate account deletion from their profile or account settings.
  - Upon confirmation, the system marks the account as deleted by setting a soft delete flag in the database.
    Soft-deleted accounts are prevented from logging in or performing any actions.
  - The account data remains preserved for audit or recovery purposes unless purged by admin policy.

---

- **ID:** FR-011
- **Description:** Logged-in users shall be able to log out of the application.
- **Acceptance Criteria:**
  - Users are able to log out from any authenticated session.
  - Upon logout, the authentication token stored on the client is removed or invalidated.
  - Logged-out users are not able to access protected resources without re-authentication.

---

### 3.2 KYC for Claimant Accounts

- **ID:** FR-012
- **Description:** Claimants shall be required to submit their KYC details, including personal, bank, and tax-related information, along with supporting documents.
- Acceptance Criteria:
  - Claimants are able to submit their name, account type, account number, bank name, IFSC code, PAN number, and optional GST number.
  - The following documents will be required:
    - Bank proof (e.g., cancelled cheque or bank statement)
    - PAN card
    - GST certificate (only if GST number is provided)
    - The GST certificate is required only if a GST number is provided.

---

- **ID:** FR-013
- **Description:** Once KYC details are submitted by the claimant, they shall become read-only and cannot be modified by the claimant.
- **Acceptance Criteria:**
  - After successful submission of KYC details, the claimant can not edit or resubmit the KYC form.

---

- **ID:** FR-014
- **Description:** KYC details submitted by a claimant shall only be editable by an `Admin` after submission.
- **Acceptance Criteria:**
  - `Admin` users have access to edit or update any part of a claimant's submitted KYC information.
  - `Admin` users are able to update both textual details and uploaded documents.
  - All changes made by `Admin` user are logged with a timestamp and the `Admin` user identifier for audit purposes.
  - Claimants are not able edit or overwrite KYC data once submitted.

---

### 3.3 Claim Submission For Vendors

- **ID:** FR-015
- **Description:** Vendors shall be able to fill and submit a claim form, which may contain one or more individual claims.
- **Acceptance Criteria:**
  - Vendors are able to initiate a new claim form from their dashboard.
  - A claim form can include multiple individual claim entries.
  - Vendors are able to review and submit the form once all necessary claims are added.
  - Once submitted, the claim form is locked from further edits by the vendor.

---

- **ID:** FR-016
- **Description:** Each individual claim within a claim form shall capture detailed billing information provided by the vendor.
- **Acceptance Criteria:**
  - Vendors are required to enter the following for each claim:
    - Bill number
    - Date of the bill
    - Amount excluding GST
    - GST amount
    - Soft copy of the bill (file upload)
    - Whether the bill is a proforma invoice (for advance payment) or a final invoice.
  - All fields are mandatory for each claim.
  - The soft copy must be a valid file format (e.g., PDF, JPG, PNG) and within the allowed size limit.

---

- **ID:** FR-017
- **Description:** Vendors shall be required to acknowledge a declaration confirming the correctness of the provided details and understanding that no further edits can be made after submission.
- **Acceptance Criteria:**
  - A checkbox or signature field is presented at the end of the claim form.
  - The vendor acknowledges that the claim form cannot be edited after submission.
  - The claim form cannot be submitted unless the declaration checkbox is selected.

---

### 3.4 Claim Approval For Vendors

- **ID:** FR-018
- **Description:** Once a vendor submits a claim form, the status of the form and all individual claims within it shall be set to In Review.
- **Acceptance Criteria:**
  - Upon successful submission of a claim form, the system assigns a status of `IN_REVIEW` to the parent claim form.
  - Each individual claim entry within the form is also marked as `IN_REVIEW`.
  - Statuses are visible to both vendor and authorized reviewers.

---

- **ID:** FR-019
- **Description:** Operators shall be able to determine TDS applicability for each vendor claim and enter the relevant deduction details.
- **Acceptance Criteria:**
  - Reviewers are able to mark whether TDS is applicable on a submitted claim.
  - If applicable, the operator is able to enter the TDS amount to be deducted.

---

- **ID:** FR-020
- **Description:** Operators shall determine GST applicability for each vendor claim and enter GST-related details.
- **Acceptance Criteria:**
  - Operators are able to mark whether GST is applicable for a claim.
  - If applicable, operators must enter the GST amount and select the ACM state GST registration under which the claim is to be recorded.
  - Operators must also specify the GST type as either:
    - Intra-State
    - Inter-State

---

- **ID** FR-027
- **Description:** For each individual claim within a submitted claim form, the operator shall enter a financial breakdown including the basic amount, GST amount (if applicable), and TDS amount (if applicable).
- **Acceptance Criteria:**
  - For every individual claim under a submitted form, the operator is required to input:
    - Basic amount (excluding GST)
    - GST amount (only if GST is applicable)
    - TDS amount (only if TDS is applicable)
  - TDS and GST applicability flags previously entered (per FR-019 and FR-020) determine whether corresponding fields are required.
  - Entered amounts are stored against each claim and used in final payable calculation at the claim form level.

---

- **ID:** FR-021
- **Description:** Vendors shall be allowed to edit individual claims only when both the claim form and the specific claim are marked with the status `REWORK_NEEDED`.
- **Acceptance Criteria:**
  - `Vendors` are able to edit individual claims only when:
    - The parent claim form status is `REWORK_NEEDED`, and
    - The individual claim status is also `REWORK_NEEDED`.
  - Edited claims can be resubmitted only after making changes.
  - Once resubmitted, the claim and its parent form return to the `IN_REVIEW` status.

---

- **ID:** FR-025
- **Description:** Reviewers shall be required to enter a reason for marking a claim as `REWORK_NEEDED`.
- **Acceptance Criteria:**
  - Each rework action must be accompanied by a comment stating the required correction.
  - This comment is visible to the vendor on their dashboard.

---

- **ID:** FR-022
- **Description:** The system shall display the final payable amount for each claim form, updated based on claim approvals and TDS deductions.
- **Acceptance Criteria:**
  - Only approved claims are included in the payable amount.
  - TDS amounts, if applicable, are subtracted from the total. The total sanctioned amount is updated dynamically as claim statuses are changed during the review process.
  - The payable amount updates automatically when any claim is approved or rejected. The final total sanctioned amount is displayed in the claim form view available to both vendors and reviewers.

---

- **ID:** FR-023
- **Description:** The operator shall enter payment details into the application once the payment is processed. This includes the payment date, bank reference number, and the final disbursed amount against the sanctioned claim form.
- **Acceptance Criteria:**
  - The operator is able to record the payment date, total disbursed amount, and bank reference number for each approved claim form.
  - The final disbursed amount is manually entered by the operator.
  - Payment status is updated to `PAID` upon successful entry of payment details.

---

- **ID:** FR-024
- **Description:** All approval and payment-related actions shall be logged with a timestamp and the identifier of the user performing the action for audit purposes.
- **Acceptance Criteria:**
  - Each approval or rejection of a claim is logged with the exact time and the user (reviewer or admin) who performed the action.
  - Each payment entry or update by the operator is logged similarly.
  - Logs include the action type, affected claim, user identifier, and timestamp.
  - Logs are retained and viewable only by users with `ADMIN` role.

---

- **FR-026:** Claim Form Reference Number Generation
- **Description:** A unique, human-readable reference number shall be generated upon submission of every claim form.
- **Acceptance Criteria:**
  - The reference number format includes event code, vendor short code, and a sequential ID or timestamp (e.g., EVT123-VND01-0004).
  - It is generated only after the form is successfully submitted.
  - It is visible to vendors and reviewers and used in all future correspondence or logs.

---

## 4. Non-Functional Requirements

### 4.1 Performance

- System should support up to 500 concurrent users

### 4.2 Security

- Passwords encrypted (bcrypt)
- HTTPS enforced
- Role-based access control

### 4.3 Usability

- Responsive UI for desktop and mobile
- Accessible (ARIA-compliant)

### 4.4 Maintainability

- Modular codebase
- CI/CD enabled (e.g., GitHub Actions)

---

## 5. Assumptions and Dependencies

- Users will be verified manually before onboarding
- Email service will be integrated via SendGrid
- AWS S3 will be used for document storage
