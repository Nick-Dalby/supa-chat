const { createClient } = supabase

supabase = createClient(
  'https://gbfmknbmcphlxtrexmlk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZm1rbmJtY3BobHh0cmV4bWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk2MzM2NzEsImV4cCI6MTk4NTIwOTY3MX0.QCVGHtI7nFcwBc69UeIKUFSuA66sj2dlcwCtwo2nn4w'
)

const messagesElement = document.getElementById('messages')

function sanitizeText(text) {
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
  });
}

function addMessageToPage(message) {
  const element = document.createElement('li')
  element.classList.add('m-2')
  element.innerHTML = `<div class="card-body">
  <div class="row align-items-start">
    <div
      class="col-2 p-0 d-flex justify-content-center flex-column align-items-center"
    >
      <img
        src="https://avatars.dicebear.com/api/initials/${sanitizeText(message.username)}.svg?r=50"
        class="rounded-circle w-50"
        alt="${sanitizeText(message.username)}"
      />
      <p class="avatar-username">${sanitizeText(message.username)}</p>
    </div>
    <div class="col-10">
      <div
        class="bg-success rounded-3 p-1 px-2 text-white w-auto h-auto d-inline-block"
      >
        <p class="p-0 m-0">
        ${sanitizeText(message.content)}
        </p>
      </div>
      <div class="row">
        <p class="col-sm-12 text-end">${sanitizeText(message.created_at)}</p>
      </div>
    </div>
  </div>
</div>`

  messagesElement.append(element)
  setTimeout(() => {
    element.scrollIntoView({ behavior: 'smooth' })
  }, 500)
}

const form = document.querySelector('form')
const contentElement = document.getElementById('content')

async function init() {
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const formData = new FormData(form)
    const message = {
      username: formData.get('username'),
      content: formData.get('content'),
    }
    
    contentElement.value = ''

    supabase
      .from('messages')
      .insert([message])
      .then(() => {
        console.log('sent')
      })
  })

  let { data: messages, error } = await supabase.from('messages').select('*')

  messages.forEach(addMessageToPage)

  supabase
    .channel('public:messages')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      (payload) => {
        addMessageToPage(payload.new)
        console.log('Change received!', payload)
      }
    )
    .subscribe()
}

init()
