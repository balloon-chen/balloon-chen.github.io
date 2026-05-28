/**
 * Google Sheets spreadsheet integration utility.
 * Since sandbox environment Google Sheets APIs are disabled, 
 * we use a secure and highly reliable Google Apps Script Web App route.
 */

export interface SyncResult {
  success: boolean;
  message: string;
}

/**
 * Submits the birthday wishes to the target Google Spreadsheet using
 * the deployed Apps Script Web App URL.
 */
export async function submitWishToGoogleSheet(wish1: string, wish2: string, wish3: string): Promise<SyncResult> {
  const configuredUrl = (import.meta as any).env.VITE_GOOGLE_SCRIPT_URL;
  // Fallback to the user's deployment URL if environment variable is not configured
  const url = configuredUrl || "https://script.google.com/macros/s/AKfycbzWU9F_DDpeO9XNQEJkONSXY1NanfbaHmXS21BtbSB_b77ekSJ7BMDIroU_-rvo7Dfg/exec";
  
  if (!url) {
    console.warn("VITE_GOOGLE_SCRIPT_URL is not configured and fallback is empty.");
    return {
      success: false,
      message: "未設定 VITE_GOOGLE_SCRIPT_URL 環境變數，願望暫存於本地。"
    };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        wish: wish1,
        wish1: wish1,
        wish2: wish2,
        wish3: wish3,
        colA: wish1,
        colB: wish2,
        colC: wish3,
        a: wish1,
        b: wish2,
        c: wish3
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data && (data.status === 'success' || data.success)) {
      return {
        success: true,
        message: "願望已成功同步至暫存表單 A, B, C 欄！"
      };
    } else {
      return {
        success: false,
        message: "同步回傳異常，請檢查 Apps Script 設定。"
      };
    }
  } catch (error: any) {
    console.error("Error submitting wish to Google Sheets:", error);
    return {
      success: false,
      message: `網路同步失敗: ${error?.message || error}`
    };
  }
}
