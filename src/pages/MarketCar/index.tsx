'use client'
import React, { useState, useEffect } from 'react'
import '/public/style.css'
import { BsSearch } from 'react-icons/bs'
import { FaCartArrowDown } from 'react-icons/fa'

interface IProdutos {
    id: string,
    titulo: string,
    preco: number,
    imagem: string
}

interface IshoppingItem {
    produto: IProdutos,
    quantidade: number
}

const MarketCarPages = () => {
    const [produtos, setProdutos] = useState<IProdutos[]>([])
    const [shoppingCurso, setShoppingCurso] = useState<IshoppingItem[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [sortOption, setSortOption] = useState('relevance') // Estado para a opção de ordenação
    const [currentPage, setCurrentPage] = useState(1)
    const [productsPerPage] = useState(12)

    useEffect(() => {
        if (searchTerm.length > 2) {
            fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${searchTerm}&sort=${sortOption}`)
                .then(response => response.json())
                .then(data => {
                    const produtosFromAPI = data.results.map((item: any) => ({
                        id: item.id,
                        titulo: item.title,
                        preco: item.price,
                        imagem: item.thumbnail
                    }))
                    setProdutos(produtosFromAPI)
                })
                .catch(error => console.error('Erro ao carregar os produtos: ', error))
        } else {
            setProdutos([])
        }

        document.addEventListener('scroll', function () {
            const header = document.querySelector('.header');
            const container = document.querySelector('.container')
            if (window.scrollY > 50) { // Ajuste o valor conforme necessário
                header?.classList.add('expanded');
                container?.classList.add('teste')
            } else {
                header?.classList.remove('expanded');
                container?.classList.remove('teste')
            }
        });
    }, [searchTerm, sortOption])

    // Função para ordenar os produtos
    const sortProducts = (option: string) => {
        switch (option) {
            case 'price_asc':
                return [...produtos].sort((a, b) => a.preco - b.preco)
            case 'price_desc':
                return [...produtos].sort((a, b) => b.preco - a.preco)
            default:
                return produtos
        }
    }

    // Produtos por página
    const indexOfLastProduct = currentPage * productsPerPage
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage
    const currentProducts = sortProducts(sortOption).slice(indexOfFirstProduct, indexOfLastProduct)

    // Trocar de página
    const handlePageChange = (pageNumber: number) => setCurrentPage(pageNumber)

    // Função para lidar com a mudança na opção de ordenação
    const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSortOption(event.target.value)
        setCurrentPage(1) // Resetar para a primeira página quando a ordenação muda
    }

    // Função para adicionar produto ao carrinho
    const handleAddProduto = (id: string) => {
        const produto = produtos.find(produto => produto.id === id)

        if (!produto) return

        // Simular o produto "voando" para o carrinho
        const cartIcon = document.querySelector('.cart-icon') as HTMLElement
        const productImage = document.querySelector(`.produto-item img[src="${produto.imagem}"]`) as HTMLImageElement
        if (!productImage || !cartIcon) return

        const flyImage = productImage.cloneNode(true) as HTMLImageElement
        const productRect = productImage.getBoundingClientRect()
        const cartRect = cartIcon.getBoundingClientRect()

        flyImage.style.position = 'fixed'
        flyImage.style.left = `${productRect.left}px`
        flyImage.style.top = `${productRect.top}px`
        flyImage.style.width = `${productRect.width}px`
        flyImage.style.height = `${productRect.height}px`

        document.body.appendChild(flyImage)

        setTimeout(() => {
            flyImage.style.transform = `translateX(${cartRect.left - productRect.left}px) translateY(${cartRect.top - productRect.top}px) scale(0.2)`
            flyImage.style.transition = 'transform 0.7s ease-in-out'

            flyImage.addEventListener('transitionend', () => {
                document.body.removeChild(flyImage)
                cartIcon.classList.add('cart-icon-bounce')
                setTimeout(() => cartIcon.classList.remove('cart-icon-bounce'), 300)
            })
        }, 0)

        // Adicionar o produto ao carrinho
        const produtoExistenteShopping = shoppingCurso.find(item => item.produto.id === id)
        if (produtoExistenteShopping) {
            const newShoppingCurso = shoppingCurso.map(item => {
                if (item.produto.id === id) {
                    return { ...item, quantidade: item.quantidade + 1 }
                }
                return item
            })
            setShoppingCurso(newShoppingCurso)
        } else {
            setShoppingCurso([...shoppingCurso, { produto, quantidade: 1 }])
        }
    }

    // Função para remover produto do carrinho
    const handleRemoveProduto = (id: string) => {
        const newShoppingCurso = shoppingCurso
            .map(item => {
                if (item.produto.id === id) {
                    return {
                        ...item,
                        quantidade: item.quantidade - 1
                    }
                }
                return item
            })
            .filter(item => item.quantidade > 0)

        setShoppingCurso(newShoppingCurso)
    }

    // Função para calcular o total
    const calculateTotal = () => {
        return shoppingCurso.reduce((total, item) => total + item.produto.preco * item.quantidade, 0).toFixed(2)
    }

    // Função para imprimir o carrinho
    const printShoppingCart = () => {
        const printContent = shoppingCurso
            .map(item => (
                `<p>Título: ${item.produto.titulo} | Preço: ${item.produto.preco} | Quantidade: ${item.quantidade} | Total: ${item.produto.preco * item.quantidade}</p>`
            ))
            .join('')

        const printWindow = window.open('', '', 'height=600,width=800')
        if (printWindow) {
            printWindow.document.write('<html><head><title>Carrinho de Compras</title></head><body>')
            printWindow.document.write('<h1>Carrinho de Compras</h1>')
            printWindow.document.write(printContent)
            printWindow.document.write(`<h2>Valor Total: R$ ${calculateTotal()}</h2>`)
            printWindow.document.write('</body></html>')
            printWindow.document.close()
            printWindow.focus()
            printWindow.print()
        }
    }

    // Função para alternar visibilidade do carrinho
    function toggleCartVisibility() {
        const cart = document.getElementById('cart') as HTMLElement

        if (cart.classList.contains('show')) {
            cart.classList.add('hide')
            cart.classList.remove('show')
        } else {
            cart.classList.add('show')
            cart.classList.remove('hide')
        }
    }

    // Botões de paginação
    const totalPages = Math.ceil(produtos.length / productsPerPage)

    // JavaScript para adicionar/remover a classe 'expanded' ao cabeçalho




    return (
        <div className="container">
            {/* Cabeçalho */}
            <header className="header">
                <h1>
                    <span style={{ color: 'red' }}>Tech</span>Smart
                </h1>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Buscar produtos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <BsSearch className="search-icon" />
                </div>
                <button className="cart-icon" onClick={toggleCartVisibility}>
                    <FaCartArrowDown />
                </button>
            </header>

            <div className="content">
                <main className="main">
                    <div className="header-sort">
                        <h2>Produtos Disponíveis</h2>
                        <select value={sortOption} onChange={handleSortChange} className="sort-select">
                            <option value="relevance">Relevância</option>
                            <option value="price_asc">Preço: Menor para Maior</option>
                            <option value="price_desc">Preço: Maior para Menor</option>
                        </select>
                    </div>
                    <div className="produtos-list">
                        {currentProducts.length > 0 ? (
                            currentProducts.map(produto => (
                                <div key={produto.id} className="produto-item">
                                    <img src={produto.imagem} alt={produto.titulo} className="produto-imagem" />
                                    <div className="produto-info">
                                        <p className="titulo">{produto.titulo}</p>
                                        <p className="preco">Preço: R$ {produto.preco.toFixed(2)}</p>
                                    </div>
                                    <button
                                        onClick={() => handleAddProduto(produto.id)}
                                        className="add-button"
                                    >
                                        Adicionar ao Carrinho
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p>Nenhum produto encontrado.</p>
                        )}
                    </div>
                    {/* Paginação */}
                    <div className="pagination">
                        <button
                            className="pagination-button"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </button>
                        <span className="pagination-info">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            className="pagination-button"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Próxima
                        </button>
                    </div>
                </main>

                {/* Carrinho de Compras */}
                <div className="cart" id="cart">
                    <h1>Carrinho de Compras</h1>
                    <ul>
                        {shoppingCurso.map((item) => (
                            <li key={item.produto.id} className="cart-item">
                                <div className="item-info">
                                    <p className="title">Título: {item.produto.titulo}</p>
                                    <p>Preço: R$ {item.produto.preco.toFixed(2)}</p>
                                    <p>Quantidade: {item.quantidade}</p>
                                    <p>Total: R$ {(item.produto.preco * item.quantidade).toFixed(2)}</p>
                                    <button
                                        onClick={() => handleRemoveProduto(item.produto.id)}
                                        className="remove-button"
                                    >
                                        Remover
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <h2 className="total">Valor Total: R$ {calculateTotal()}</h2>
                    <button onClick={printShoppingCart} className="print-button">
                        Imprimir Carrinho
                    </button>
                </div>
            </div>

            {/* Rodapé */}
            <footer className="footer">
                <p>© 2024 TechSmart. Todos os direitos reservados.</p>
                <p>
                    <a href="/contato">Contato</a> | <a href="/sobre">Sobre</a>
                </p>
            </footer>
        </div>
    )
}

export default MarketCarPages
