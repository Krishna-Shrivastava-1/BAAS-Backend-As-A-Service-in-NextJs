import database from '@/database/database'
import { authenticateUser } from '@/lib/Authenticator'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

const page = async ({ params }) => {
  const { subserv } = await params
  const loggedUserCheck = await authenticateUser()
  const token = (await cookies()).get("authtoken")?.value

  if (!loggedUserCheck?.success) {
    return redirect('/sign-in')
  }

  const resp = await fetch(`${process.env.NextJsBaseUrl}/api/platform/project/fetchonlyoneservice/${subserv}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `authtoken=${token}`,
    },
    cache: 'no-store',
  })

  const data = await resp.json()
  const projectData = data?.projectData || {}
  const fields = projectData?.serviceSchema?.fields || []
  const isLogin = projectData?.subServiceName?.toLowerCase() === 'login'
  const isLogout = projectData?.subServiceName?.toLowerCase() === 'logout'

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      {/* HEADER */}
      <header className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-semibold mb-2">
          {projectData?.subServiceName} Configuration
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          This section displays how your service’s integration works and its expected API request format.
        </p>
      </header>

      {/* MAIN GRID */}
      <div className="max-w-5xl mx-auto grid gap-8 grid-cols-1 md:grid-cols-2">

        {/* LEFT SIDE */}
        <section className="bg-card border border-border rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-1">Form Preview</h2>
          <p className="text-xs text-muted-foreground mb-4">
            {isLogin || isLogout
              ? `This service does not require a custom schema. The form below represents the default ${isLogin ? 'Login' : 'Logout'} structure.`
              : 'This preview represents how your frontend form will appear to users.'}
          </p>

          {/* LOGIN / LOGOUT FORM CASES */}
          {isLogin ? (
            <form className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 rounded-md border border-border bg-muted/5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 rounded-md border border-border bg-muted/5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled
                />
              </div>

              <button
                type="button"
                disabled
                className="w-full rounded-md py-2 px-4 bg-primary text-primary-foreground font-medium opacity-80 cursor-not-allowed"
              >
                Sign In
              </button>
            </form>
          ) : isLogout ? (
            <div className="text-sm text-muted-foreground">
              This service only requires your API key in the header to log the user out.
              <br />No request body is needed.
            </div>
          ) : fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">No fields configured yet.</p>
          ) : (
            <form className="space-y-4">
              {fields.map((field) => (
                <div key={field.key} className="flex flex-col">
                  <label className="text-sm font-medium text-muted-foreground mb-1">
                    {field.name}
                  </label>
                  <input
                    type={field.key.toLowerCase().includes('password') ? 'password' : 'text'}
                    placeholder={`Enter ${field.name}`}
                    className="px-3 py-2 rounded-md border border-border bg-muted/5 text-foreground 
                           focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled
                  />
                </div>
              ))}
              <button
                type="button"
                disabled
                className="w-full rounded-md py-2 px-4 bg-primary text-primary-foreground font-medium opacity-80 cursor-not-allowed"
              >
                Submit
              </button>
            </form>
          )}
        </section>

        {/* RIGHT SIDE: API DOCS */}
        <section className="bg-card border border-border rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-1">API Integration</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Integrate using the following endpoint and headers.
          </p>

          {/* Endpoint */}
          <div className="mb-4 space-y-1">
            <p className="text-xs font-medium uppercase text-muted-foreground">Endpoint</p>
            <div className="font-mono text-sm bg-muted/10 border overflow-x-scroll border-border rounded-md p-2">
              POST{" "}
              {`${process.env.NextJsBaseUrl || 'https://yourapi.com'}/api/tenant/${projectData?.serviceName?.toLowerCase()}/${isLogin ? 'signin' : isLogout ? 'logout' : 'registration'}`}
            </div>
          </div>

          {/* Headers */}
          <div className="mb-4 space-y-1">
            <p className="text-xs font-medium uppercase text-muted-foreground">Headers</p>
            <div className="font-mono text-sm bg-muted/10 border border-border rounded-md p-3">
              Content-Type: application/json<br />
              Authorization: Bearer <span className="text-primary font-semibold">YOUR_API_KEY</span>
            </div>
          </div>

          {/* Body Example */}
          <div className="mb-6">
            <p className="text-xs font-medium uppercase text-muted-foreground mb-1">Body Example</p>
            <pre className="p-4 text-sm overflow-x-auto bg-muted/10 border border-border rounded-md text-muted-foreground">
              {isLogin
                ? `{
  "email": "example@email.com",
  "password": "yourpassword"
}`
                : isLogout
                  ? `{}`
                  : `{
${fields.map(f => `  "${f.key}": "example_${f.key}"`).join(",\n")}
}`}
            </pre>
          </div>

          {/* Frontend Example */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Frontend Example (JavaScript)</h3>
            <pre className="p-4 text-sm overflow-x-auto bg-muted/10 border border-border rounded-md text-muted-foreground">
              {`await fetch("${process.env.NextJsBaseUrl || 'https://yourapi.com'}/api/tenant/${projectData?.serviceName?.toLowerCase()}/${isLogin ? 'signin' : isLogout ? 'logout' : 'registration'}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_KEY"
  },
  body: JSON.stringify(${
    isLogin
      ? `{
    email: "user@example.com",
    password: "password123"
  }`
      : isLogout
        ? `{}`
        : `{
${fields.map(f => `    ${f.key}: "user_${f.key}"`).join(",\n")}
  }`
  })
})`}
            </pre>
          </div>
        </section>
      </div>

      {/* RAW DATA (only when custom schema exists) */}
      {!isLogin && !isLogout && (
        <section className="max-w-5xl mx-auto mt-8 bg-card border border-border rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-2">Form Schema (Raw JSON)</h3>
          <p className="text-xs text-muted-foreground mb-3">
            This JSON defines your custom registration fields.
          </p>
          <pre className="p-4 text-sm overflow-x-auto bg-muted/10 text-muted-foreground border border-border rounded-md">
            {JSON.stringify(fields, null, 2)}
          </pre>
        </section>
      )}
    </div>
  )
}

export default page
