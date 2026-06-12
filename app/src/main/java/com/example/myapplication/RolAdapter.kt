package com.example.myapplication

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.myapplication.model.Rol

class RolAdapter(
    private val items: MutableList<Rol>,
    private val onSeleccionar: (Rol) -> Unit,
    private val onEliminar: (Rol) -> Unit
) : RecyclerView.Adapter<RolAdapter.VH>() {

    inner class VH(v: View) : RecyclerView.ViewHolder(v) {
        val tvCodigo:      TextView = v.findViewById(R.id.tvCodigoRol)
        val tvDescripcion: TextView = v.findViewById(R.id.tvDescripcionRol)
        val btnEliminar:   Button   = v.findViewById(R.id.btnEliminarRol)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.item_rol, parent, false)
        return VH(v)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val r = items[position]
        holder.tvCodigo.text      = r.codigoRol
        holder.tvDescripcion.text = r.descripcionRol

        // Tap en la fila → cargar en el formulario para editar
        holder.itemView.setOnClickListener { onSeleccionar(r) }

        holder.btnEliminar.setOnClickListener { onEliminar(r) }
    }

    override fun getItemCount(): Int = items.size
}
