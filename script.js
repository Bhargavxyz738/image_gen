document.addEventListener("DOMContentLoaded", () => {
  const DeveloperCardName = document.getElementById("dev-username");
  const DeveloperCardImage = document.getElementById("dev-image");
  const devCard = document.querySelector(".dev-id");
  const promptInput = document.getElementById("prompt-input");
  const generateBtn = document.getElementById("send-btn");
  const promptGalleryBtn = document.getElementById("prompt-gallery");
  const gridBtn = document.getElementById("toggle-grid");
  const modalOverlay = document.querySelector(".modal-overlay");
  const modalTitle = document.querySelector(".modal-title");
  const modalBody = document.querySelector(".modal-body");
  const closeModalBtn = document.querySelector(".modal-close");
  const imageGrid = document.getElementById("image-grid");
  const errorMessage = document.querySelector(".error-message");

  let currentGridSize = 1;
  const API_KEY = "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";
  const API_URL =
    "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";

  async function get_dev_card_info(userID) {
    const base_url = `https://api.github.com/users/${userID}`;
    try {
      const response = await fetch(base_url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      DeveloperCardName.textContent = data.login;
      DeveloperCardImage.src = data.avatar_url;
      DeveloperCardImage.alt = data.login;
      DeveloperCardImage.title = data.login;
      devCard.addEventListener("click", () =>
        window.open(data.html_url, "_blank")
      );
    } catch (error) {
      console.log(error);
    }
  }

  async function generateImages(prompt) {
    generateBtn.disabled = true;
    imageGrid.innerHTML = "";
    errorMessage.textContent = "";

    for (let i = 0; i < currentGridSize; i++) {
      const placeholder = document.createElement("div");
      placeholder.className = "placeholder";
      const spinner = document.createElement("div");
      spinner.className = "placeholder-spinner";
      placeholder.appendChild(spinner);
      imageGrid.appendChild(placeholder);
    }

    const promises = Array.from({ length: currentGridSize }, () =>
      fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({ inputs: prompt }),
      })
    );

    try {
      const results = await Promise.allSettled(promises);
      const placeholders = document.querySelectorAll(".placeholder");

      for (let i = 0; i < results.length; i++) {
        const currentPlaceholder = placeholders[i];
        const result = results[i];

        if (result.status === "fulfilled") {
          const response = result.value;
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || `HTTP error! status: ${response.status}`
            );
          }
          const blob = await response.blob();
          const imgUrl = URL.createObjectURL(blob);

          const wrapper = document.createElement("div");
          wrapper.className = "image-wrapper";

          const img = document.createElement("img");
          img.src = imgUrl;
          img.alt = prompt;

          const actions = document.createElement("div");
          actions.className = "image-actions";
          actions.innerHTML = `
              <button class="download-btn" title="Download"><i class="fa-solid fa-download"></i></button>
              <button class="zoom-btn" title="Zoom"><i class="fa-solid fa-magnifying-glass-plus"></i></button>
            `;

          wrapper.appendChild(img);
          wrapper.appendChild(actions);
          currentPlaceholder.replaceWith(wrapper);
        } else {
          console.error(`Image ${i + 1} failed to generate:`, result.reason);
          currentPlaceholder.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i>Failed to load`;
          currentPlaceholder.classList.add("error");
        }
      }
    } catch (error) {
      console.error(error);
      errorMessage.textContent = `Error: ${error.message}. Please check your key or try again.`;
      imageGrid.innerHTML = "";
    } finally {
      generateBtn.disabled = false;
    }
  }

  const openModal = (title, contentHTML) => {
    modalTitle.textContent = title;
    modalBody.innerHTML = contentHTML;
    modalOverlay.classList.remove("hidden");
  };

  const closeModal = () => {
    modalOverlay.classList.add("hidden");
  };

  const prompts = [
    {
      title: "Cyberpunk City",
      prompt:
        "A sprawling cyberpunk city at night, neon lights reflecting on wet streets, flying vehicles, highly detailed, cinematic lighting.",
    },
    {
      title: "Enchanted Forest",
      prompt:
        "An enchanted forest with glowing mushrooms and mystical creatures, sunlight filtering through the canopy, fantasy, ultra realistic.",
    },
    {
      title: "Steampunk Inventor",
      prompt:
        "A portrait of a steampunk inventor in his workshop, surrounded by gears and gadgets, warm vintage tones, 8k resolution.",
    },
    {
      title: "Futuristic Spaceport",
      prompt:
        "A bustling futuristic spaceport with ships taking off and landing, aliens and humans interacting, neon signage, ultra-detailed sci-fi scene.",
    },
    {
      title: "Ancient Temple",
      prompt:
        "An ancient temple hidden in the jungle, overgrown with vines, sunlight streaming through cracks, mystical atmosphere, hyper-realistic.",
    },
    {
      title: "Underwater City",
      prompt:
        "A majestic underwater city with bioluminescent buildings, schools of colorful fish swimming around, mysterious and serene, highly detailed.",
    },
    {
      title: "Medieval Market",
      prompt:
        "A bustling medieval market scene, people trading goods, detailed architecture, cobblestone streets, warm sunlight, cinematic realism.",
    },
    {
      title: "Post-Apocalyptic Wasteland",
      prompt:
        "A desolate post-apocalyptic wasteland with ruined buildings, abandoned vehicles, dust storms, dramatic lighting, ultra-realistic details.",
    },
    {
      title: "Mystical Mountain Peak",
      prompt:
        "A high mountain peak with a floating temple above the clouds, glowing magical energy, dramatic sky, fantasy epic scene, 8k detail.",
    },
    {
      title: "Cyber Samurai",
      prompt:
        "A cyberpunk samurai standing on a neon-lit street, rain falling, futuristic armor with glowing circuits, cinematic action pose, ultra-detailed.",
    },
  ];

  const getPromptGalleryHTML = () => {
    let html = '<ul class="prompt-list">';
    prompts.forEach((item) => {
      html += `<li data-prompt="${item.prompt}"><p>${item.title}</p><span>${item.prompt}</span></li>`;
    });
    html += "</ul>";
    return html;
  };

  const getGridSettingsHTML = () => {
    const options = [
      { size: 1, icon: "fa-square", label: "1 Image" },
      { size: 2, icon: "fa-table-cells-large", label: "2 Images" },
      { size: 3, icon: "fa-table-cells", label: "3 Images" },
      { size: 4, icon: "fa-braille", label: "4 Images" },
    ];
    let optionsHTML = options
      .map(
        (opt) => `
            <div class="grid-option ${
              opt.size === currentGridSize ? "active" : ""
            }" data-size="${opt.size}" title="${opt.label}">
                <i class="fa-solid ${opt.icon}"></i><span>${opt.label}</span>
            </div>`
      )
      .join("");
    return `<p>Select the number of images to generate at once.</p><div class="grid-options-container">${optionsHTML}</div>`;
  };

  generateBtn.addEventListener("click", () => {
    const prompt = promptInput.value.trim();
    if (!API_KEY) {
      alert("Please add your Hugging Face API key to the script.js file.");
      return;
    }
    if (!prompt) {
      alert("Please enter a prompt.");
      return;
    }
    generateImages(prompt);
  });

  promptGalleryBtn.addEventListener("click", () =>
    openModal("Prompt Gallery", getPromptGalleryHTML())
  );
  gridBtn.addEventListener("click", () =>
    openModal("Grid Settings", getGridSettingsHTML())
  );
  closeModalBtn.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", (event) => {
    if (event.target === modalOverlay) closeModal();
  });

  modalBody.addEventListener("click", (event) => {
    const promptListItem = event.target.closest(".prompt-list li");
    if (promptListItem) {
      promptInput.value = promptListItem.dataset.prompt;
      closeModal();
      return;
    }
    const gridOption = event.target.closest(".grid-option");
    if (gridOption) {
      currentGridSize = parseInt(gridOption.dataset.size, 10);
      modalBody
        .querySelectorAll(".grid-option")
        .forEach((btn) => btn.classList.remove("active"));
      gridOption.classList.add("active");
      setTimeout(closeModal, 200);
    }
  });

  imageGrid.addEventListener("click", (event) => {
    const target = event.target;
    const downloadBtn = target.closest(".download-btn");
    if (downloadBtn) {
      const imageWrapper = downloadBtn.closest(".image-wrapper");
      const img = imageWrapper.querySelector("img");
      const a = document.createElement("a");
      a.href = img.src;
      a.download = "generated-image.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    const zoomBtn = target.closest(".zoom-btn");
    if (zoomBtn) {
      const imageWrapper = zoomBtn.closest(".image-wrapper");
      const img = imageWrapper.querySelector("img");
      window.open(img.src, "_blank");
    }
  });

  get_dev_card_info("Bhargavxyz738");
});
