// 1. Initialize Supabase Connection
const SUPABASE_URL = "YOUR_SUPABASE_URL_HERE";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY_HERE";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Mobile Nav Drawer Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

hamburger.addEventListener('click', () => {
  navMenu.classList.toggle('open');
});

// 3. Load Dynamic Projects from Supabase
async function loadProjects(categoryFilter = 'all') {
  const grid = document.getElementById('projectsGrid');
  grid.innerHTML = '<p>Loading latest portfolio items...</p>';

  let query = supabase.from('projects').select('*').eq('status', 'published');

  if (categoryFilter !== 'all') {
    query = query.eq('category', categoryFilter);
  }

  const { data: projects, error } = await query;

  if (error) {
    console.error('Error fetching projects:', error);
    grid.innerHTML = '<p>Failed to load projects. View on Behance.</p>';
    return;
  }

  if (projects.length === 0) {
    grid.innerHTML = '<p>No projects found in this category.</p>';
    return;
  }

  grid.innerHTML = projects.map(proj => `
    <div class="project-card">
      <img src="${proj.featured_image_url}" alt="${proj.title}" style="width: 100%; border-radius: 8px; margin-bottom: 15px;" />
      <h3>${proj.title}</h3>
      <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 10px;">${proj.description}</p>
      <div style="display: flex; gap: 10px;">
        ${proj.behance_url ? `<a href="${proj.behance_url}" target="_blank" class="btn btn-secondary" style="font-size:0.8rem;">Behance</a>` : ''}
        ${proj.live_demo_url ? `<a href="${proj.live_demo_url}" target="_blank" class="btn btn-primary" style="font-size:0.8rem;">Live Demo</a>` : ''}
      </div>
    </div>
  `).join('');
}

// 4. Category Filter Buttons Listener
document.querySelectorAll('.tab').forEach(button => {
  button.addEventListener('click', (e) => {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    const category = e.target.getAttribute('data-category');
    loadProjects(category);
  });
});

// 5. Contact & Hire Notification Submission
const hireForm = document.getElementById('hireForm');

hireForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.innerText = 'Sending Inquiry...';

  const formData = {
    client_name: document.getElementById('clientName').value,
    client_email: document.getElementById('clientEmail').value,
    project_type: document.getElementById('projectType').value,
    budget_range: document.getElementById('budgetRange').value,
    message: document.getElementById('projectMessage').value,
    created_at: new Date().toISOString()
  };

  // Option A: Save submission into Supabase table
  const { error } = await supabase.from('inquiries').insert([formData]);

  if (error) {
    alert('Something went wrong. Opening WhatsApp direct connection...');
  } else {
    alert('Thank you! Your inquiry has been sent directly to Azan Ali.');
  }

  // Option B: Redirect to WhatsApp automatically with pre-filled message
  const whatsappMsg = `Hi Azan, my name is ${formData.client_name} (${formData.client_email}). I want to hire you for a ${formData.project_type} project with a budget of ${formData.budget_range}. Details: ${formData.message}`;
  const whatsappUrl = `https://wa.me/923554051652?text=${encodeURIComponent(whatsappMsg)}`;
  
  window.open(whatsappUrl, '_blank');
  
  hireForm.reset();
  submitBtn.innerText = 'Send Direct Inquiry';
});

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
  loadProjects();
});