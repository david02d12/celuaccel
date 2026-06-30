package com.example.myapplication

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
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

        val imgProducto:       ImageView = view.findViewById(R.id.imgProducto)
        val placeholderImg:    View      = view.findViewById(R.id.placeholderImg)
        val tvCategoriaCatalogo: TextView = view.findViewById(R.id.tvCategoriaCatalogo)
        val tvNombreCatalogo:  TextView  = view.findViewById(R.id.tvNombreCatalogo)
        val tvPrecioCatalogo:  TextView  = view.findViewById(R.id.tvPrecioCatalogo)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_producto_catalogo, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val prod = productos[position]

        holder.tvNombreCatalogo.text  = prod.nombre
        holder.tvPrecioCatalogo.text  = "$${"%.0f".format(prod.precio)}"

        val catNombre = categorias.find { it.idCategoria == prod.idCategoria }?.nombreCategoria ?: "Sin categoría"
        holder.tvCategoriaCatalogo.text = catNombre


        holder.imgProducto.visibility    = View.GONE
        holder.placeholderImg.visibility = View.VISIBLE


        holder.itemView.setOnClickListener { onDetalleClick(prod) }
    }

    override fun getItemCount(): Int = productos.size

    fun actualizarLista(nuevaLista: List<Producto>) {
        productos = nuevaLista
        notifyDataSetChanged()
    }
}
