
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Produto } from './models/produto.model';
import { ProdutosService } from './services/produtos.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  produtos: Produto[] = [];

  idBusca: number | null = null;
  produtoEncontrado: Produto | null = null;

  nome = '';
  preco: number | null = null;

  idEditando: number | null = null;
  nomeEdicao = '';
  precoEdicao: number | null = null;

  mensagem = '';
  erro = '';

  constructor(private produtosService: ProdutosService) {}

  ngOnInit(): void {
    this.listarTodos();
  }

  listarTodos(): void {
    this.produtosService.listarTodos().subscribe({
      next: (produtos) => {
        this.produtos = produtos;
        this.erro = '';
      },
      error: () => {
        this.erro = 'Não foi possível carregar os produtos.';
      }
    });
  }

  buscarPorId(): void {
    if (this.idBusca === null || this.idBusca <= 0) {
      this.erro = 'Informe um ID válido.';
      this.produtoEncontrado = null;
      return;
    }

    this.erro = '';
    this.mensagem = '';
    this.produtoEncontrado = null;

    this.produtosService.buscarPorId(this.idBusca).subscribe({
      next: (produto) => {
        this.produtoEncontrado = produto;
      },
      error: () => {
        this.erro = 'Produto não encontrado.';
      }
    });
  }

  adicionar(): void {
    if (!this.nome.trim() || this.preco === null || this.preco < 0) {
      this.erro = 'Informe um nome e um preço válido.';
      return;
    }

    const novoProduto = {
      nome: this.nome.trim(),
      preco: this.preco
    };

    this.produtosService.criar(novoProduto).subscribe({
      next: () => {
        this.mensagem = 'Produto cadastrado com sucesso.';
        this.erro = '';
        this.nome = '';
        this.preco = null;
        this.listarTodos();
      },
      error: () => {
        this.erro = 'Não foi possível cadastrar o produto.';
      }
    });
  }

  iniciarEdicao(produto: Produto): void {
    this.idEditando = produto.id;
    this.nomeEdicao = produto.nome;
    this.precoEdicao = produto.preco;
    this.mensagem = '';
    this.erro = '';
  }

  cancelarEdicao(): void {
    this.idEditando = null;
    this.nomeEdicao = '';
    this.precoEdicao = null;
  }

  salvarEdicao(): void {
    if (
      this.idEditando === null ||
      !this.nomeEdicao.trim() ||
      this.precoEdicao === null ||
      this.precoEdicao < 0
    ) {
      this.erro = 'Informe um nome e um preço válido.';
      return;
    }

    const produtoAtualizado = {
      nome: this.nomeEdicao.trim(),
      preco: this.precoEdicao
    };

    this.produtosService
      .atualizar(this.idEditando, produtoAtualizado)
      .subscribe({
        next: () => {
          this.mensagem = 'Produto atualizado com sucesso.';
          this.erro = '';
          this.cancelarEdicao();
          this.listarTodos();
        },
        error: () => {
          this.erro = 'Não foi possível atualizar o produto.';
        }
      });
  }

  remover(produto: Produto): void {
    const confirmar = window.confirm(
      `Deseja remover o produto "${produto.nome}"?`
    );

    if (!confirmar) {
      return;
    }

    this.produtosService.remover(produto.id).subscribe({
      next: () => {
        this.mensagem = 'Produto removido com sucesso.';
        this.erro = '';

        if (this.produtoEncontrado?.id === produto.id) {
          this.produtoEncontrado = null;
        }

        this.listarTodos();
      },
      error: () => {
        this.erro = 'Não foi possível remover o produto.';
      }
    });
  }
}
