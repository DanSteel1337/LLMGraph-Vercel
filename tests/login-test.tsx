// This is a client-side test script that can be run in the browser console
// to verify the login process works correctly

function testLoginProcess() {
  console.log("🧪 Starting login process test...")

  // Step 1: Check if we're on the login page
  const isLoginPage = window.location.pathname === "/login"
  console.log(`✓ On login page: ${isLoginPage}`)

  if (!isLoginPage) {
    console.log("❌ Test failed: Not on login page. Please navigate to /login first.")
    return
  }

  // Step 2: Check if the login form exists
  const usernameInput = document.querySelector('input[name="username"]')
  const passwordInput = document.querySelector('input[name="password"]')
  const loginButton = document.querySelector('button[type="submit"]')

  if (!usernameInput || !passwordInput || !loginButton) {
    console.log("❌ Test failed: Login form elements not found.")
    return
  }

  console.log("✓ Login form elements found.")

  // Step 3: Fill in the form with test credentials
  const testUsername = "123456abc"
  const testPassword = "123456abc"

  // Use the input event to trigger React's onChange
  const fillInput = (input, value) => {
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set
    nativeInputValueSetter.call(input, value)

    const event = new Event("input", { bubbles: true })
    input.dispatchEvent(event)
  }

  fillInput(usernameInput, testUsername)
  fillInput(passwordInput, testPassword)

  console.log(`✓ Filled form with test credentials (${testUsername}/${testPassword}).`)

  // Step 4: Submit the form
  console.log("🔄 Submitting login form...")

  // Create a click event
  const clickEvent = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    view: window,
  })

  // Listen for navigation
  let navigationOccurred = false
  const originalPushState = history.pushState
  history.pushState = function () {
    navigationOccurred = true
    return originalPushState.apply(this, arguments)
  }

  // Submit the form
  loginButton.dispatchEvent(clickEvent)

  // Check for auth token after a short delay
  setTimeout(() => {
    // Step 5: Check if auth token was set
    const hasAuthToken = document.cookie.includes("auth_token=")
    console.log(`✓ Auth token set: ${hasAuthToken}`)

    // Step 6: Check if navigation occurred
    console.log(`✓ Navigation occurred: ${navigationOccurred}`)

    // Restore original history.pushState
    history.pushState = originalPushState

    // Final result
    if (hasAuthToken && navigationOccurred) {
      console.log("✅ Login process test PASSED!")
    } else {
      console.log("❌ Login process test FAILED!")
      console.log("Issues detected:")
      if (!hasAuthToken) console.log("- Auth token not set in cookies")
      if (!navigationOccurred) console.log("- Navigation to dashboard did not occur")
    }
  }, 1000)
}

// Run the test
testLoginProcess()
