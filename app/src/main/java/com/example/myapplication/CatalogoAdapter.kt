package com.example.myapplication

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.model.Categoria
import com.example.myapplication.model.Producto

class CatalogoAdapter(
    private var productos: List<Producto>,
    private val categorias: List<Categoria>,
    private val onDetalleClick: (Producto) -> Unit
) : RecyclerView.Adapter<CatalogoAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val imgProducto: ImageView = view.findViewById(R.id.imgProductoCatalogo)
        val txtCategoria: TextView = view.findViewById(R.id.txtCategoriaBadge)
        val txtNombre: TextView = view.findViewById(R.id.txtNombreProdCat)
        val txtPrecio: TextView = view.findViewById(R.id.txtPrecioProdCat)
        val txtStock: TextView = view.findViewById(R.id.txtStockProdCat)
        val btnDetalle: Button = view.findViewById(R.id.btnVerDetalle)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_producto_catalogo, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val prod = productos[position]
        
        holder.txtNombre.text = prod.nombre
        holder.txtPrecio.text = "$${prod.precio}"
        holder.txtStock.text = "Stock: ${prod.cantidad}"
        
        val catNombre = categorias.find { it.idCategoria == prod.idCategoria }?.nombreCategoria ?: "Sin categoría"
        holder.txtCategoria.text = catNombre

        // Glide could be used here for image loading if added, fallback to placeholder for now
        // Glide.with(holder.itemView).load(prod.imagen).into(holder.imgProducto)

        holder.btnDetalle.setOnClickListener {
            onDetalleClick(prod)
        }
    }

    override fun getItemCount(): Int = productos.size

    fun actualizarLista(nuevaLista: List<Producto>) {
        productos = nuevaLista
        notifyDataSetChanged()
    }
}
