function botaoComecar(elementoBotao) {
  elementoBotao.innerText = "Processando..."
  console.log("Botão Clicado")
  console.log("Redirecionando usuário para página de Login")
  window.location.href = "/src/login/login.html"
}

// Array com os usuários (banco simples)
    const usuarios = [
      { usuario: "admin", senha: "123" },
      { usuario: "joao",  senha: "abc" },
      { usuario: "maria", senha: "456" }
    ];

    function fazerLogin() {
      // Pega o que o usuário digitou
      let usuarioDigitado = document.getElementById("usuario").value;
      let senhaDigitada = document.getElementById("senha").value;

      let mensagem = document.getElementById("mensagem");

      // Limpa mensagem anterior
      mensagem.textContent = "";

      // Procura se o usuário existe no array
      let usuarioEncontrado = null;

      for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].usuario === usuarioDigitado && 
            usuarios[i].senha === senhaDigitada) {
          usuarioEncontrado = usuarios[i];
          break;   // para o loop quando encontrar
        }
      }

      // Verifica se encontrou
      if (usuarioEncontrado) {
        mensagem.style.color = "green";
        mensagem.textContent = "✅ Login feito com sucesso!";
      } else {
        mensagem.style.color = "red";
        mensagem.textContent = "❌ Usuário ou senha errados!";
      }
    }