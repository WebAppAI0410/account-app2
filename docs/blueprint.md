# **App Name**: EventBalance

## Core Features:

- イベント管理: イベントの名前、日付、説明などの詳細を使って、イベントを作成、表示、削除できるようにします。イベントデータはローカルに保存し、支払期日の設定も可能です。
- 参加者管理: イベントへの参加者の追加、各個人の貢献額の指定、貢献が支払い済みか未払いかのマークを可能にします。1列目に名前、2列目に金額を記載したexcelシートを直接インポートできる機能を追加します。
- 経費追跡: 金額、日付、説明などの詳細とともに、各イベントの費用を記録します。
- 収支概要: 総収入、総支出を計算し、各イベントの最終的な残高を提供し、黒字か赤字かを示します。

## Style Guidelines:

- 背景の透明度を確保するために、クリーンな白または薄いグレーを基本色として使用します。
- 主要なアクションとヘッダーには、落ち着いた青色（#6200EE）または緑色を secondary color として使用します。
- キー情報やインタラクティブな要素を強調するために、ティール色（#009688）をアクセントとして使用します。
- データ入力と概要には、明確で読みやすいフォントを使用します。
- エントリを追加するための「+」や経費のための「円」など、アクションやカテゴリを表す直感的なアイコンを使用します。
- イベントの詳細、参加者リスト、経費を分離するために、タブ付きインターフェースまたは明確なセクションを使用します。
- 画面間の移行時やデータを更新する際に、控えめなアニメーションを使用します。

## Original User Request:
We would like to develop an Android application that helps manage expenses and income for various events (e.g., parties, trips, or club activities). The primary goal is to allow users to track individual payments, record event-related expenses, and generate a final balance sheet or report. Below are the main requirements:

1. **Purpose & Scope**  
   - Manage multiple events or “projects” (e.g., party, trip, competition).  
   - For each event, collect data about participants’ contributions (income) and the event’s expenditures.  
   - Generate a summary of total income, total expenses, and the remaining balance.  
   - Ideally, provide an option to export or create PDF reports.

2. **Application Platform**  
   - The initial release should be an Android application that stores all data locally on the device.  
   - Potential to extend functionality later by integrating cloud services like Firebase for data synchronization across multiple users.

3. **Key Features**  
   1. **Event (Project) Management**  
      - Create, view, and delete events.  
      - Each event should have a name, date, and a description or notes if necessary.

   2. **Participant (Income) Management**  
      - Add participants to an event, specifying each individual’s name and expected contribution.  
      - Mark contributions as “paid” or “unpaid,” allowing quick status checks.  
      - (Optional) Include a CSV import function to batch-add participants and their contribution amounts.

   3. **Expense Tracking**  
      - Record expenses for each event (e.g., venue fees, beverage costs, supplies, etc.).  
      - Show a list of all expenses with the amount spent, date, and a brief description.

   4. **Income/Expense Summary**  
      - Calculate total income and total expenses to provide a final balance for each event.  
      - Show whether the balance is positive (surplus) or negative (deficit).

   5. **Reporting & PDF Export** (Optional but desired)  
      - Generate a PDF or similar report that summarizes income, expenses, and any outstanding balance.  
      - Provide functionality to share or save the report to local storage.

4. **Data Storage & Architecture**  
   - Use an offline database with Room (SQLite) for data persistence.  
   - Follow MVVM architecture with ViewModel classes to separate business logic from UI.  
   - Ensure that future cloud synchronization (e.g., Firebase) can be integrated without major structural changes.

5. **User Interface**  
   - **Home Screen**: Event list with buttons to create a new event.  
   - **Event Detail Screen**: Tabs or sections for “Participants” (with paid/unpaid status) and “Expenses.”  
   - **Edit/Entry Screens**: Forms to add or edit participant and expense details.  
   - **Report Screen**: Displays the total income, total expenses, and calculated balance.

6. **Build & Deployment**  
   - Develop the application in Kotlin using Android Studio.  
   - Produce an APK or AAB for internal testing.  
   - (Optional) Deploy to Google Play Store if a broader audience needs access.  
   - Implement version control (e.g., Git) to manage the source code effectively.

7. **Additional Considerations**  
   - Backup / Export to avoid data loss if a device is lost or replaced.  
   - Streamlined UI/UX to allow quick data entry, especially during on-site events.  
   - Localization or multi-language support if required by international users.

By providing the above specifications to the Fire studio AI Agent, we aim to receive a well-structured Android app that meets the needs of club and party organizers, allowing for efficient tracking of member contributions and event expenses.
  