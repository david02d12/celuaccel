package com.example.myapplication

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.model.Producto

class ProductoAdapter(
    private val productos: MutableList<Producto>,
    private val onEditar:   ((Producto) -> Unit)? = null,
    private val onEliminar: ((Producto) -> Unit)? = null
) : RecyclerView.Adapter<ProductoAdapter.VH>() {

    inner class VH(v: View) : RecyclerView.ViewHolder(v) {
        val tvNombre:    TextView = v.findViewById(R.id.tvNombreCatalogo)
        val tvPrecio:    TextView = v.findViewById(R.id.tvPrecioCatalogo)
        val tvCategoria: TextView = v.findViewById(R.id.tvCategoriaCatalogo)
        val imgProducto: android.widget.ImageView = v.findViewById(R.id.imgProducto)
        val placeholderImg: View = v.findViewById(R.id.placeholderImg)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val v = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_producto_catalogo, parent, false)
        return VH(v)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        holder.tvNombre.text    = prod.nombre
        holder.tvPrecio.text    = "$${"%.0f".format(prod.precio)}"
        holder.tvCategoria.text = "Stock: ${prod.cantidad}"

        val imgUrl = prod.imagen ?: ""
        if (imgUrl.isNotEmpty()) {
            com.bumptech.glide.Glide.with(holder.itemView.context)
                .load(imgUrl)
                .placeholder(R.color.celuaccel_divider)
                .into(holder.imgProducto)
            holder.imgProducto.visibility    = View.VISIBLE
            holder.placeholderImg.visibility = View.GONE
        } else {
            holder.imgProducto.visibility    = View.GONE
            holder.placeholderImg.visibility = View.VISIBLE
        }


        holder.itemView.setOnClickListener {
            onEditar?.invoke(prod)
        }


        holder.itemView.setOnLongClickListener {
            onEliminar?.invoke(prod)
            true
        }
    }

    override fun getItemCount(): Int = productos.size
}
